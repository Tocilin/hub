import { expect, test } from "@playwright/test";

import { E2E_UNAPPROVED_EMAIL } from "./support/constants";
import { expectAccessible } from "./support/fixtures";
import { countNewEmailsTo, snapshotInbox } from "./support/supabase";

test.use({ storageState: { cookies: [], origins: [] } });

test.describe("signed out", () => {
  for (const path of ["/", "/settings", "/apps/finance"]) {
    test(`${path} redirects to login`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveURL("/login");
      await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
    });
  }

  test("login page is accessible and sends security headers", async ({ page }) => {
    const response = await page.goto("/login");
    const headers = response!.headers();
    expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(headers["x-frame-options"]).toBe("DENY");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["strict-transport-security"]).toContain("max-age=");
    expect(headers["x-powered-by"]).toBeUndefined();
    await expectAccessible(page);
  });

  test("an unapproved email looks the same but is never sent a code", async ({ page }) => {
    const seen = await snapshotInbox(E2E_UNAPPROVED_EMAIL);
    await page.goto("/login");
    await page.getByLabel("Email").fill(E2E_UNAPPROVED_EMAIL);
    await page.getByRole("button", { name: "Send code" }).click();

    await expect(page.getByText(`If ${E2E_UNAPPROVED_EMAIL} can use HUB`)).toBeVisible();
    await page.getByLabel("Sign-in code").fill("123456");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "That code is incorrect or has expired." }),
    ).toBeVisible();

    // Give a (wrongly) sent email time to arrive before asserting there is none.
    await page.waitForTimeout(1_500);
    expect(await countNewEmailsTo(E2E_UNAPPROVED_EMAIL, seen)).toBe(0);
  });

  test("validates the email before sending anything", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByRole("button", { name: "Send code" }).click();
    await expect(
      page.getByRole("alert").filter({ hasText: "Enter a valid email address." }),
    ).toBeVisible();
    await expect(page.getByLabel("Email")).toHaveValue("not-an-email");
    await expectAccessible(page);
  });
});
