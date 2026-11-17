import axios, { AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("./auth-client", () => ({ authClient: { token: vi.fn() } }));

import { authClient } from "./auth-client";
import { api } from "./api";
import { clearAccessToken } from "./access-token";

const expiredToken = () => {
  const encode = (value: object) =>
    btoa(JSON.stringify(value)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
  return `${encode({ alg: "none" })}.${encode({ exp: 10 })}.signature`;
};

describe("API auth cookie fallback", () => {
  beforeEach(() => {
    clearAccessToken();
    vi.mocked(authClient.token).mockReset();
  });

  it("allows API calls with a session cookie even when JWT issuance fails", async () => {
    sessionStorage.setItem("crowdspark.access-token", expiredToken());
    vi.mocked(authClient.token).mockResolvedValue({
      data: null,
      error: { message: "JWT endpoint unavailable", status: 500 }
    } as never);

    const response = await api.get("/users/me", {
      adapter: async (config) => {
        const headers = AxiosHeaders.from(config.headers);
        expect(headers.has("Authorization")).toBe(false);
        expect(config.withCredentials).toBe(true);
        return {
          data: { data: { user: { id: "user-id" }, profile: null } },
          status: 200,
          statusText: "OK",
          headers: new AxiosHeaders(),
          config
        };
      }
    });

    expect(response.status).toBe(200);
    expect(authClient.token).toHaveBeenCalledTimes(1);
  });

  it("retries a 401 once without a bearer token when token creation fails", async () => {
    vi.mocked(authClient.token).mockRejectedValue(new Error("JWT unavailable"));
    let count = 0;
    const response = await api.get("/users/me", {
      adapter: async (config) => {
        count++;
        if (count === 1) {
          throw new axios.AxiosError("Unauthenticated", "ERR_BAD_REQUEST", config, undefined, {
            data: { error: { code: "AUTHENTICATION_REQUIRED" } },
            status: 401,
            statusText: "Unauthorized",
            headers: new AxiosHeaders(),
            config
          });
        }
        expect(AxiosHeaders.from(config.headers).has("Authorization")).toBe(false);
        return {
          data: { ok: true },
          status: 200,
          statusText: "OK",
          headers: new AxiosHeaders(),
          config
        };
      }
    });

    expect(response.status).toBe(200);
    expect(count).toBe(2);
  });
});
