import { describe, expect, it, vi } from "vitest";

import { parseEnv, publicEnvSchema } from "./env";
import { serverEnvSchema } from "./env.server";

vi.mock("server-only", () => ({}));

describe("parseEnv", () => {
  it("returns parsed public env", () => {
    const env = parseEnv(publicEnvSchema, {
      NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:54321",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_test",
    });
    expect(env.NEXT_PUBLIC_SUPABASE_URL).toBe("http://127.0.0.1:54321");
  });

  it("names invalid keys without leaking values", () => {
    const parse = () =>
      parseEnv(publicEnvSchema, {
        NEXT_PUBLIC_SUPABASE_URL: "not-a-url-secret",
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
      });
    expect(parse).toThrow(/NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY/);
    expect(parse).not.toThrow(/not-a-url-secret/);
  });

  it("normalizes the approved email", () => {
    const env = parseEnv(serverEnvSchema, { HUB_APPROVED_EMAIL: "  Me@Example.COM " });
    expect(env.HUB_APPROVED_EMAIL).toBe("me@example.com");
  });

  it("rejects a missing approved email", () => {
    expect(() => parseEnv(serverEnvSchema, {})).toThrow(/HUB_APPROVED_EMAIL/);
  });
});
