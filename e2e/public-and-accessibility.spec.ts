import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("public CrowdSpark experience", () => {
  test("navigates from home to campaign exploration", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/CrowdSpark/i);
    await page.getByRole("link", { name: "Explore Campaigns" }).first().click();
    await expect(page).toHaveURL(/\/campaigns/);
    await expect(page.getByRole("heading", { name: /explore campaigns/i })).toBeVisible();
  });

  test("has no serious or critical automated accessibility violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).disableRules(["color-contrast"]).analyze();
    const blocking = results.violations.filter((item) =>
      ["serious", "critical"].includes(item.impact ?? "")
    );
    expect(blocking).toEqual([]);
  });

  test("shows a useful not-found page", async ({ page }) => {
    await page.goto("/route-that-does-not-exist");
    await expect(page.getByRole("heading", { name: /page not found/i })).toBeVisible();
  });
});
