import { expect, test } from "@playwright/test";

async function signInAsSupporter(page: import("@playwright/test").Page) {
  await page.goto("/login");
  await page.getByRole("button", { name: "supporter demo" }).click();
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/dashboard\/supporter$/);
}

test.describe("authentication and private routes", () => {
  test("keeps a private route active after refresh", async ({ page }) => {
    await signInAsSupporter(page);
    await page.goto("/dashboard/supporter/contributions");
    await expect(page).toHaveURL(/\/dashboard\/supporter\/contributions/);
    await page.reload();
    await expect(page).toHaveURL(/\/dashboard\/supporter\/contributions/);
    await expect(page.getByText(/my contributions/i).first()).toBeVisible();
  });

  test("redirects a Supporter away from Admin routes", async ({ page }) => {
    await signInAsSupporter(page);
    await page.goto("/dashboard/admin/users");
    await expect(page).toHaveURL(/\/dashboard\/supporter$/);
  });
});
