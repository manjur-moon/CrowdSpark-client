import axios, { type InternalAxiosRequestConfig } from "axios";

import { clearAccessToken, ensureAccessToken, getAccessToken } from "./access-token";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

const TERMINAL_AUTH_CODES = new Set([
  "ACCOUNT_SUSPENDED",
  "ACCOUNT_BANNED",
  "ACCESS_TOKEN_REVOKED",
  "SESSION_REVOKED"
]);

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _accessTokenRetry?: boolean;
}

interface ApiErrorPayload {
  message?: string;

  error?: {
    code?: string;
    message?: string;
  };
}

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20_000,

  headers: {
    Accept: "application/json"
  }
});

/*
 * Attach the current access token.
 *
 * If the stored JWT is close to expiry,
 * ensureAccessToken() refreshes it before
 * the API request is sent.
 */
api.interceptors.request.use(
  async (config) => {
    const storedToken = getAccessToken();

    if (!storedToken) {
      return config;
    }

    const token = await ensureAccessToken();

    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    } else {
      config.headers.delete("Authorization");
    }

    return config;
  },
  (error: unknown) => Promise.reject(error)
);

/*
 * Recover once from an unauthorized
 * response by forcing a fresh JWT.
 *
 * refreshPromise inside access-token.ts
 * ensures multiple simultaneous 401s
 * share one token request.
 */
api.interceptors.response.use(
  (response) => response,

  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const original = error.config as RetryableRequestConfig | undefined;

    const status = error.response?.status;

    const code = getApiErrorCode(error);

    /*
     * These account/session states should
     * never trigger automatic JWT recovery.
     */
    if (code && TERMINAL_AUTH_CODES.has(code)) {
      clearAccessToken();

      return Promise.reject(error);
    }

    /*
     * Retry an ordinary 401 exactly once.
     */
    if (status === 401 && original && !original._accessTokenRetry) {
      original._accessTokenRetry = true;

      const token = await ensureAccessToken(true);

      if (!token) {
        clearAccessToken();

        return Promise.reject(error);
      }

      original.headers.set("Authorization", `Bearer ${token}`);

      return api(original);
    }

    return Promise.reject(error);
  }
);

function getApiErrorCode(error: unknown): string | null {
  if (!axios.isAxiosError<ApiErrorPayload>(error)) {
    return null;
  }

  const code = error.response?.data?.error?.code;

  return typeof code === "string" ? code : null;
}

export function apiErrorMessage(error: unknown, fallback = "Request failed"): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    const backendMessage = error.response?.data?.error?.message ?? error.response?.data?.message;

    if (typeof backendMessage === "string" && backendMessage.trim()) {
      return backendMessage;
    }

    if (error.code === "ECONNABORTED") {
      return "The request timed out. Please try again.";
    }

    if (!error.response) {
      return "Unable to reach the server. Check your connection and try again.";
    }

    if (typeof error.message === "string" && error.message.trim()) {
      return error.message;
    }

    return fallback;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
