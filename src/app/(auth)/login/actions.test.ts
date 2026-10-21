import { beforeEach, describe, expect, it, vi } from "vitest";

const auth = { signInWithOtp: vi.fn(), verifyOtp: vi.fn() };
const redirect = vi.fn();

vi.mock("server-only", () => ({}));
vi.mock("next/navigation", () => ({ redirect: (to: string) => redirect(to) }));
vi.mock("@/platform/env.server", () => ({
  getServerEnv: () => ({ HUB_APPROVED_EMAIL: "me@example.com" }),
}));
vi.mock("@/platform/supabase/server", () => ({
  createSupabaseServerClient: async () => ({ auth }),
}));

const { login } = await import("./actions");

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
};

beforeEach(() => {
  vi.clearAllMocks();
  auth.signInWithOtp.mockResolvedValue({ error: null });
  auth.verifyOtp.mockResolvedValue({ error: null });
});

describe("login: request a code", () => {
  it("rejects an invalid email", async () => {
    const state = await login({ step: "email" }, form({ intent: "request", email: "nope" }));
    expect(state).toEqual({ step: "email", email: "nope", error: "Enter a valid email address." });
  });

  it("sends a code to the approved email without creating accounts", async () => {
    const state = await login(
      { step: "email" },
      form({ intent: "request", email: " Me@Example.com " }),
    );
    expect(auth.signInWithOtp).toHaveBeenCalledWith({
      email: "me@example.com",
      options: { shouldCreateUser: false },
    });
    expect(state).toEqual({ step: "code", email: "me@example.com" });
  });

  it("looks identical for other emails but sends nothing", async () => {
    const state = await login(
      { step: "email" },
      form({ intent: "request", email: "other@example.com" }),
    );
    expect(auth.signInWithOtp).not.toHaveBeenCalled();
    expect(state).toEqual({ step: "code", email: "other@example.com" });
  });

  it("reports a failed send without details", async () => {
    auth.signInWithOtp.mockResolvedValue({
      error: { code: "over_email_send_rate_limit", status: 429 },
    });
    vi.spyOn(console, "error").mockImplementation(() => {});
    const state = await login(
      { step: "email" },
      form({ intent: "request", email: "me@example.com" }),
    );
    expect(state).toEqual({
      step: "email",
      email: "me@example.com",
      error: "Couldn't send a code right now. Try again in a minute.",
    });
  });
});

describe("login: verify the code", () => {
  const verify = (email: string, code: string) =>
    login({ step: "code", email }, form({ intent: "verify", email, code }));

  it("signs the approved user in and goes home", async () => {
    await verify("me@example.com", "123 456");
    expect(auth.verifyOtp).toHaveBeenCalledWith({
      email: "me@example.com",
      token: "123456",
      type: "email",
    });
    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("asks for a 6-digit code before calling Supabase", async () => {
    const state = await verify("me@example.com", "12345");
    expect(auth.verifyOtp).not.toHaveBeenCalled();
    expect(state).toMatchObject({ step: "code", error: "Enter the 6-digit code from the email." });
  });

  it("gives the same answer for a wrong code and an unapproved email", async () => {
    auth.verifyOtp.mockResolvedValue({ error: { code: "otp_expired" } });
    const wrongCode = await verify("me@example.com", "000000");
    const otherEmail = await verify("other@example.com", "123456");

    expect(wrongCode.error).toBe("That code is incorrect or has expired.");
    expect(otherEmail.error).toBe(wrongCode.error);
    expect(auth.verifyOtp).toHaveBeenCalledTimes(1);
    expect(redirect).not.toHaveBeenCalled();
  });

  it("can start over with a different email", async () => {
    const state = await login(
      { step: "code", email: "me@example.com" },
      form({ intent: "restart" }),
    );
    expect(state).toEqual({ step: "email" });
  });
});
