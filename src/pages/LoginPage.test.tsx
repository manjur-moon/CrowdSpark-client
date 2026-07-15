import { describe, expect, it } from "vitest";
import { safeRedirect } from "./LoginPage";

describe("login redirect validation", () => {
  it("allows local application routes", () => {
    expect(safeRedirect("/campaigns/123?tab=updates")).toBe("/campaigns/123?tab=updates");
  });

  it("blocks external and protocol-relative redirects", () => {
    expect(safeRedirect("https://malicious.example")).toBeNull();
    expect(safeRedirect("//malicious.example")).toBeNull();
  });
});
