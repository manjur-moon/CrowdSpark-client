import { expect, test } from "@playwright/test";

test("mobile navigation exposes primary links", async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.includes("mobile"), "Mobile project only");
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await expect(page.getByRole("navigation", { name: "Mobile navigation" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Explore Campaigns" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Contact" })).toBeVisible();
});
