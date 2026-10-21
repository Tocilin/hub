import { describe, expect, it } from "vitest";

import { decideRoute, isApprovedEmail } from "./access";

const approvedEmail = "me@example.com";

describe("isApprovedEmail", () => {
  it("matches case- and whitespace-insensitively", () => {
    expect(isApprovedEmail(" Me@Example.com ", approvedEmail)).toBe(true);
  });

  it("rejects other, empty and missing emails", () => {
    expect(isApprovedEmail("someone@example.com", approvedEmail)).toBe(false);
    expect(isApprovedEmail("", approvedEmail)).toBe(false);
    expect(isApprovedEmail(undefined, approvedEmail)).toBe(false);
  });
});

describe("decideRoute", () => {
  const decide = (pathname: string, email: string | null) =>
    decideRoute({ pathname, email, approvedEmail });

  it("sends signed-out visitors to login, except on the login page", () => {
    expect(decide("/", null)).toEqual({ action: "redirect", to: "/login" });
    expect(decide("/settings", null)).toEqual({ action: "redirect", to: "/login" });
    expect(decide("/login", null)).toEqual({ action: "allow" });
  });

  it("lets the approved user in and keeps them off the login page", () => {
    expect(decide("/", approvedEmail)).toEqual({ action: "allow" });
    expect(decide("/settings", approvedEmail)).toEqual({ action: "allow" });
    expect(decide("/login", approvedEmail)).toEqual({ action: "redirect", to: "/" });
  });

  it("rejects any other signed-in identity, everywhere", () => {
    for (const path of ["/", "/settings", "/login"]) {
      expect(decide(path, "intruder@example.com")).toEqual({
        action: "reject",
        to: "/login?error=unauthorized",
      });
    }
  });

  it("treats a session without an email as unapproved", () => {
    expect(decide("/", "")).toMatchObject({ action: "reject" });
  });
});
