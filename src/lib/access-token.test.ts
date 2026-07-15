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

  it("clears a token from session storage", () => {
    sessionStorage.setItem("crowdspark.access-token", "token");
    clearAccessToken();
    expect(getAccessToken()).toBeNull();
  });
});
