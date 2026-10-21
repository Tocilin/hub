import type { CookieOptionsWithName } from "@supabase/ssr";

/**
 * HUB never talks to Supabase from the browser, so auth cookies can be HttpOnly:
 * page scripts (and any injected script) can't read the session.
 */
export const authCookieOptions: CookieOptionsWithName = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
};
