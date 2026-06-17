import { test, expect } from "@playwright/test";

test("marketing landing renders and links to the board", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Terragon").first()).toBeVisible();
  await page.getByRole("link", { name: "Open the board" }).click();
  await expect(page).toHaveURL(/\/board$/);
});

test("app shell renders the board view with sidebar nav", async ({ page }) => {
  await page.goto("/board");
  await expect(page.getByRole("heading", { name: "Board" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Grooming" })).toBeVisible();
});
