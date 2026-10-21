"use server";

import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/platform/supabase/server";

import { LOGIN_PATH } from "./access";

/** Ends the session on this device and returns to the login page. */
export async function signOut() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut({ scope: "local" });
  redirect(LOGIN_PATH);
}
