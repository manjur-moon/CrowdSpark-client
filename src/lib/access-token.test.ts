import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./auth-client", () => ({
  authClient: {
    token: vi.fn()
  }
}));

import { authClient } from "./auth-client";
import {
  clearAccessToken,
  ensureAccessToken,
  getAccessToken,
  refreshAccessToken
} from "./access-token";

function createToken(expirationSeconds: number): string {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");

  return `${encode({ alg: "none", typ: "JWT" })}.${encode({ exp: expirationSeconds })}.signature`;
}

describe("access-token storage", () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.mocked(authClient.token).mockReset();
  });

  it("stores a token returned by Better Auth", async () => {
    const token = createToken(Math.floor(Date.now() / 1000) + 900);
    vi.mocked(authClient.token).mockResolvedValue({ data: { token }, error: null } as never);

    await expect(refreshAccessToken()).resolves.toBe(token);
    expect(getAccessToken()).toBe(token);
  });

  it("reuses a valid token without requesting another one", async () => {
    const token = createToken(Math.floor(Date.now() / 1000) + 900);
    sessionStorage.setItem("crowdspark.access-token", token);

    await expect(ensureAccessToken()).resolves.toBe(token);
    expect(authClient.token).not.toHaveBeenCalled();
  });

  it("reports the actual Better Auth token error", async () => {
    vi.mocked(authClient.token).mockResolvedValue({
      data: null,
      error: { message: "Session cookie not found", status: 401 }
    } as never);

    await expect(refreshAccessToken()).rejects.toThrow("Session cookie not found");
    expect(getAccessToken()).toBeNull();
  });

  it("does not reuse a cached token belonging to another user", async () => {
    const oldToken = createToken(Math.floor(Date.now() / 1000) + 900);
    const newToken = createToken(Math.floor(Date.now() / 1000) + 1200);
    sessionStorage.setItem("crowdspark.access-token", oldToken);
    sessionStorage.setItem("crowdspark.access-token-owner", "former-user");
    vi.mocked(authClient.token).mockResolvedValue({
      data: { token: newToken },
      error: null
    } as never);

    await expect(ensureAccessToken(false, "new-user")).resolves.toBe(newToken);
    expect(authClient.token).toHaveBeenCalledTimes(1);
    expect(sessionStorage.getItem("crowdspark.access-token-owner")).toBe("new-user");
  });

  it("clears a token from session storage", () => {
    sessionStorage.setItem("crowdspark.access-token", "token");
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});
