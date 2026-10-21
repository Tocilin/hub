import { execSync } from "node:child_process";

import { defineConfig, devices } from "@playwright/test";

import { E2E_EMAIL } from "./tests/e2e/support/constants";

const PORT = 3100;
const baseURL = `http://localhost:${PORT}`;

/**
 * E2E runs against local Supabase (`pnpm db:start`). Its URL and keys come from
 * `supabase status` unless already set (e.g. in CI). Workers re-evaluate this file,
 * so the values are cached in process.env after the first lookup.
 */
if (!process.env.E2E_SUPABASE_SECRET_KEY) {
  const status = JSON.parse(
    execSync("pnpm -s exec supabase status -o json", {
      stdio: ["ignore", "pipe", "ignore"],
    }).toString(),
  ) as { API_URL: string; PUBLISHABLE_KEY: string; SECRET_KEY: string; MAILPIT_URL: string };
  process.env.E2E_SUPABASE_URL = status.API_URL;
  process.env.E2E_SUPABASE_PUBLISHABLE_KEY = status.PUBLISHABLE_KEY;
  process.env.E2E_SUPABASE_SECRET_KEY = status.SECRET_KEY;
  process.env.E2E_MAILPIT_URL = status.MAILPIT_URL;
}

export default defineConfig({
  testDir: "tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    { name: "setup", testMatch: /auth\.setup\.ts/ },
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], storageState: "tests/e2e/.auth/user.json" },
      dependencies: ["setup"],
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], storageState: "tests/e2e/.auth/user.json" },
      dependencies: ["setup"],
      testMatch: /(launcher|settings)\.spec\.ts/,
    },
  ],
  webServer: {
    // A production build on its own port, with its own approved identity.
    command: `pnpm build && pnpm start -p ${PORT}`,
    url: `${baseURL}/login`,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: process.env.E2E_SUPABASE_URL ?? "",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.E2E_SUPABASE_PUBLISHABLE_KEY ?? "",
      HUB_APPROVED_EMAIL: E2E_EMAIL,
    },
  },
});
