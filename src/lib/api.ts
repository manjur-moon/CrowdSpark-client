import axios, { type InternalAxiosRequestConfig } from "axios";
import { clearAccessToken, ensureAccessToken, getAccessToken } from "./access-token";

const baseURL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1";

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _accessTokenRetry?: boolean;
}

export const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20000,
  headers: { Accept: "application/json" }
});

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const original = error.config as RetryableRequestConfig | undefined;
    const code = error.response?.data?.error?.code;

    if (
      ["ACCOUNT_SUSPENDED", "ACCOUNT_BANNED", "ACCESS_TOKEN_REVOKED", "SESSION_REVOKED"].includes(
        String(code)
      )
    ) {
      clearAccessToken();
    }

    if (error.response?.status === 401 && original && !original._accessTokenRetry) {
      original._accessTokenRetry = true;
      const token = await ensureAccessToken(true);
      if (token) {
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      }
      clearAccessToken();
    }

    return Promise.reject(error);
  }
);

export function apiErrorMessage(error: unknown, fallback = "Request failed") {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.error?.message ??
      error.response?.data?.message ??
      error.message ??
      fallback
    );
  }
  return error instanceof Error ? error.message : fallback;
}
