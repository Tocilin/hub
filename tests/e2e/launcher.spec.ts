import { expect, test } from "@playwright/test";

import { getLauncherApps } from "@/platform/registry";

import { expectAccessible } from "./support/fixtures";

test.describe("HUB home", () => {
  test("renders every launcher app from the registry, in order", async ({ page }) => {
    await page.goto("/");
    const tiles = page.getByRole("list", { name: "Apps" }).getByRole("listitem");
    await expect(tiles).toHaveText(getLauncherApps().map((app) => new RegExp(app.name)));
  });

  test("coming-soon apps can't be launched", async ({ page }) => {
    await page.goto("/");
    const comingSoon = getLauncherApps().filter((app) => app.status === "coming-soon");
    for (const app of comingSoon) {
      await expect(page.getByRole("link", { name: new RegExp(app.name) })).toHaveCount(0);
    }
    await expect(page.getByText("(coming soon)")).toHaveCount(comingSoon.length);

    // A direct visit doesn't reach a fake page either.
    await page.goto(`/apps/${comingSoon[0]!.id}`);
    await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
  });

  test("opens settings, and login sends a signed-in user home", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL("/settings");
    await page.getByRole("link", { name: "HUB" }).click();
    await expect(page).toHaveURL("/");

    await page.goto("/login");
    await expect(page).toHaveURL("/");
  });

  test("fits the viewport with adequate touch targets", async ({ page }) => {
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);

    const settings = await page.getByRole("link", { name: "Settings" }).boundingBox();
    expect(settings!.width).toBeGreaterThanOrEqual(44);
    expect(settings!.height).toBeGreaterThanOrEqual(44);

    const columns = await page
      .getByRole("list", { name: "Apps" })
      .evaluate((list) => getComputedStyle(list).gridTemplateColumns.split(" ").length);
    const width = page.viewportSize()!.width;
    expect(columns).toBe(width < 640 ? 3 : width < 1024 ? 4 : width < 1280 ? 5 : 6);
  });

  test("is accessible", async ({ page }) => {
    await page.goto("/");
    await expectAccessible(page);
  });
});
