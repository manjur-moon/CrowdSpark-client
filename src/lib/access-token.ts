import { authClient } from "./auth-client";

const STORAGE_KEY = "crowdspark.access-token";
const STORAGE_OWNER_KEY = "crowdspark.access-token-owner";

const REFRESH_WINDOW_SECONDS = 60;

let refreshPromise: Promise<string | null> | null = null;

/*
 * Incrementing this value invalidates an access-token request
 * that started before logout/account switching.
 */
let tokenGeneration = 0;

interface JwtPayload {
  exp?: number;
}

function decodePayload(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1];

    if (!payload) {
      return null;
    }

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");

    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");

    const decoded = atob(padded);

    const parsed = JSON.parse(decoded) as unknown;

    if (typeof parsed !== "object" || parsed === null) {
      return null;
    }

    return parsed as JwtPayload;
  } catch {
    return null;
  }
}

function readStorage(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): boolean {
  try {
    sessionStorage.setItem(key, value);

    return true;
  } catch {
    return false;
  }
}

function removeStorage(key: string): void {
  try {
    sessionStorage.removeItem(key);
  } catch {
    // Storage may be unavailable in restrictive browser contexts.
  }
}

function clearStoredAccessToken(): void {
  removeStorage(STORAGE_KEY);
  removeStorage(STORAGE_OWNER_KEY);
}

export function getAccessToken(): string | null {
  return readStorage(STORAGE_KEY);
}

export function clearAccessToken(): void {
  /*
   * Invalidate any token request that may currently
   * be running before removing the stored token.
   */
  tokenGeneration += 1;

  refreshPromise = null;

  clearStoredAccessToken();
}

function tokenNeedsRefresh(token: string): boolean {
  const payload = decodePayload(token);

  if (typeof payload?.exp !== "number" || !Number.isFinite(payload.exp)) {
    return true;
  }

  const now = Math.floor(Date.now() / 1000);

  return payload.exp <= now + REFRESH_WINDOW_SECONDS;
}

export async function refreshAccessToken(ownerId?: string): Promise<string | null> {
  /*
   * Multiple API calls may notice an expiring token
   * at the same time. They should all share one
   * refresh request.
   */
  if (refreshPromise) {
    return refreshPromise;
  }

  const generationAtStart = tokenGeneration;

  const promise = (async (): Promise<string | null> => {
    try {
      const result = await authClient.token();

      /*
       * Logout or account switching happened while
       * the token request was in flight.
       *
       * Never write that stale result back into
       * sessionStorage.
       */
      if (generationAtStart !== tokenGeneration) {
        return null;
      }

      if (result.error || !result.data?.token) {
        clearStoredAccessToken();

        return null;
      }

      const token = result.data.token;

      const stored = writeStorage(STORAGE_KEY, token);

      if (!stored) {
        clearStoredAccessToken();

        return null;
      }

      if (ownerId) {
        const ownerStored = writeStorage(STORAGE_OWNER_KEY, ownerId);

        if (!ownerStored) {
          clearStoredAccessToken();

          return null;
        }
      } else {
        /*
         * A token without a known owner remains usable
         * by legacy callers, but AuthContext will refresh
         * it once an expected user ID is supplied.
         */
        removeStorage(STORAGE_OWNER_KEY);
      }

      return token;
    } catch {
      if (generationAtStart === tokenGeneration) {
        clearStoredAccessToken();
      }

      return null;
    }
  })();

  refreshPromise = promise;

  try {
    return await promise;
  } finally {
    /*
     * clearAccessToken() may already have replaced/
     * invalidated the active refresh while this request
     * was running, so only clear our own promise.
     */
    if (refreshPromise === promise) {
      refreshPromise = null;
    }
  }
}

export async function ensureAccessToken(
  force = false,
  expectedOwnerId?: string
): Promise<string | null> {
  let current = getAccessToken();

  /*
   * A JWT cached for another authenticated account
   * must never be reused for the new session.
   */
  if (current && expectedOwnerId) {
    const storedOwner = readStorage(STORAGE_OWNER_KEY);

    if (storedOwner !== expectedOwnerId) {
      clearAccessToken();

      current = null;
    }
  }

  if (!force && current && !tokenNeedsRefresh(current)) {
    return current;
  }

  return refreshAccessToken(expectedOwnerId);
}
