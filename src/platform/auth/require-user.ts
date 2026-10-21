import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { cache } from "react";

import { getServerEnv } from "@/platform/env.server";
import { createSupabaseServerClient } from "@/platform/supabase/server";

import { isApprovedEmail, LOGIN_PATH } from "./access";

/**
 * The authorization gate. Call it in every protected layout, page, Server Action and
 * Route Handler. Returns the approved user or redirects; never trusts getSession().
 * Cached per request, so calling it more than once is free.
 */
export const requireUser = cache(async (): Promise<User> => {
  const supabase = await createSupabaseServerClient();
  // getUser() asks the Auth server, so a revoked or forged session can't pass.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(LOGIN_PATH);
  if (!isApprovedEmail(user.email, getServerEnv().HUB_APPROVED_EMAIL)) {
    redirect(`${LOGIN_PATH}?error=unauthorized`);
  }
  return user;
});
