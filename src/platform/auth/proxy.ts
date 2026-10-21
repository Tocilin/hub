import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getPublicEnv } from "@/platform/env";
import { getServerEnv } from "@/platform/env.server";

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

  // getClaims() verifies the JWT and refreshes it when expired. Don't run code between
  // creating the client and this call, or sessions can be dropped at random.
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims ? (data.claims.email ?? "") : null;

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
