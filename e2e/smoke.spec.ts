import { test, expect } from "@playwright/test";

test("marketing landing renders (public)", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Terragon").first()).toBeVisible();
});

test("protected routes redirect to login when signed out", async ({ page }) => {
  await page.goto("/board");
  await expect(page).toHaveURL(/\/login/);
  await expect(
    page.getByRole("button", { name: /Continue with GitHub/ }),
  ).toBeVisible();
});
