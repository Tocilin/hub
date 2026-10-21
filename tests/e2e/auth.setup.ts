import { test as setup } from "@playwright/test";

import { signIn } from "./support/fixtures";

setup("sign in once and save the session", async ({ page }) => {
  await signIn(page);
  await page.context().storageState({ path: "tests/e2e/.auth/user.json" });
});
