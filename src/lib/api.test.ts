import axios from "axios";
import { describe, expect, it } from "vitest";
import { apiErrorMessage } from "./api";

describe("apiErrorMessage", () => {
  it("prefers the server error message", () => {
    const error = new axios.AxiosError("request failed");
    error.response = {
      data: { error: { message: "Insufficient credits" } },
      status: 422,
      statusText: "Unprocessable Entity",
      headers: {},
      config: { headers: new axios.AxiosHeaders() }
    };
    expect(apiErrorMessage(error)).toBe("Insufficient credits");
  });

  it("uses the provided fallback for unknown values", () => {
    expect(apiErrorMessage(null, "Fallback message")).toBe("Fallback message");
  });
});
