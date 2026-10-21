import { expect, test } from "@playwright/test";

import { signIn } from "./support/fixtures";

// Its own session, so signing out doesn't affect the shared one.
test.use({ storageState: { cookies: [], origins: [] } });

test("signing out ends the session for good", async ({ page, context }) => {
  await signIn(page);

  const authCookies = (await context.cookies()).filter((cookie) => cookie.name.startsWith("sb-"));
  expect(authCookies.length).toBeGreaterThan(0);
  expect(authCookies.every((cookie) => cookie.httpOnly)).toBe(true);

  await page.goto("/settings");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL("/login");

  await page.goto("/settings");
  await expect(page).toHaveURL("/login");

  // Replaying the pre-sign-out cookies must not get back in (or loop).
  await context.addCookies(authCookies);
  await page.goto("/settings");
  await expect(page).toHaveURL("/login");
});
