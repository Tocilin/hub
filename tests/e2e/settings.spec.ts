import { expect, test } from "@playwright/test";

import { E2E_EMAIL } from "./support/constants";
import { expectAccessible } from "./support/fixtures";

test.describe("settings", () => {
  test("shows the signed-in account", async ({ page }) => {
    await page.goto("/settings");
    await expect(page.getByText(`Signed in as ${E2E_EMAIL}`)).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
  });

  test("theme choice applies and persists across reloads", async ({ page }) => {
    await page.goto("/settings");
    const html = page.locator("html");

    await page.getByRole("radio", { name: "Dark" }).click();
    await expect(html).toHaveClass(/\bdark\b/);
    await page.reload();
    await expect(html).toHaveClass(/\bdark\b/);
    await expect(page.getByRole("radio", { name: "Dark" })).toHaveAttribute("aria-checked", "true");
    await expectAccessible(page);

    await page.getByRole("radio", { name: "Light" }).click();
    await expect(html).not.toHaveClass(/\bdark\b/);
    await page.reload();
    await expect(html).not.toHaveClass(/\bdark\b/);
    await expectAccessible(page);
  });
});
