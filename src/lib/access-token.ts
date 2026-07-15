import { authClient } from "./auth-client";

const STORAGE_KEY = "crowdspark.access-token";
const REFRESH_WINDOW_SECONDS = 60;
let refreshPromise: Promise<string | null> | null = null;

interface JwtPayload {
  exp?: number;
}

function decodePayload(token: string): JwtPayload | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

export function getAccessToken(): string | null {
  return sessionStorage.getItem(STORAGE_KEY);
}

export function clearAccessToken(): void {
  sessionStorage.removeItem(STORAGE_KEY);
}

function tokenNeedsRefresh(token: string): boolean {
  const payload = decodePayload(token);
  if (!payload?.exp) return true;
  return payload.exp <= Math.floor(Date.now() / 1000) + REFRESH_WINDOW_SECONDS;
}

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const result = await authClient.token();
    if (result.error || !result.data?.token) {
      clearAccessToken();
      return null;
    }

    sessionStorage.setItem(STORAGE_KEY, result.data.token);
    return result.data.token;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export async function ensureAccessToken(force = false): Promise<string | null> {
  const current = getAccessToken();
  if (!force && current && !tokenNeedsRefresh(current)) return current;
  return refreshAccessToken();
}
