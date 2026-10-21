import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getPublicEnv } from "@/platform/env";
import { getServerEnv } from "@/platform/env.server";
import { authCookieOptions } from "@/platform/supabase/cookie-options";

import { decideRoute } from "./access";

/**
 * Refreshes the Supabase session cookie and redirects by auth state.
 * A convenience layer only: requireUser() is the real authorization check.
 */
export async function authProxy(request: NextRequest): Promise<NextResponse> {
  const env = getPublicEnv();
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookieOptions: authCookieOptions,
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
          for (const [key, value] of Object.entries(headers)) response.headers.set(key, value);
        },
      },
    },
  );

  // getUser() checks the session with the Auth server (and refreshes it). A local JWT check
  // (getClaims) would accept a signed-out session until it expires, while requireUser()
  // rejects it, and the two would redirect each other in a loop. Don't run code between
  // creating the client and this call, or sessions can be dropped at random.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user ? (user.email ?? "") : null;

  const decision = decideRoute({
    pathname: request.nextUrl.pathname,
    email,
    approvedEmail: getServerEnv().HUB_APPROVED_EMAIL,
  });

  if (decision.action === "allow") return response;
  if (decision.action === "reject") await supabase.auth.signOut();

  // Carry over refreshed or cleared auth cookies onto the redirect.
  const redirect = NextResponse.redirect(new URL(decision.to, request.url));
  for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
  return redirect;
}
