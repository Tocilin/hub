"use server";

import { redirect } from "next/navigation";

import { isApprovedEmail } from "@/platform/auth/access";
import { getServerEnv } from "@/platform/env.server";
import { createSupabaseServerClient } from "@/platform/supabase/server";

import { codeSchema, emailSchema, type LoginState } from "./schema";

const INVALID_CODE = "That code is incorrect or has expired.";

/** One action for both steps, chosen by the submit button's `intent`. */
export async function login(_previous: LoginState, formData: FormData): Promise<LoginState> {
  const intent = formData.get("intent");
  if (intent === "restart") return { step: "email" };

  const rawEmail = formData.get("email");
  const email = emailSchema.safeParse(rawEmail);
  if (!email.success) {
    return {
      step: "email",
      email: typeof rawEmail === "string" ? rawEmail : undefined,
      error: "Enter a valid email address.",
    };
  }

  const approved = isApprovedEmail(email.data, getServerEnv().HUB_APPROVED_EMAIL);

  if (intent === "request") {
    // Only the approved address ever gets an email. Everyone sees the same next step,
    // so the form never reveals which address is allowed.
    if (approved) {
      const supabase = await createSupabaseServerClient();
      const { error } = await supabase.auth.signInWithOtp({
        email: email.data,
        options: { shouldCreateUser: false },
      });
      if (error) {
        console.error("Sign-in code request failed", { code: error.code, status: error.status });
        return {
          step: "email",
          email: email.data,
          error: "Couldn't send a code right now. Try again in a minute.",
        };
      }
    }
    return { step: "code", email: email.data };
  }

  const code = codeSchema.safeParse(formData.get("code"));
  if (!code.success) {
    return { step: "code", email: email.data, error: "Enter the 6-digit code from the email." };
  }
  if (!approved) return { step: "code", email: email.data, error: INVALID_CODE };

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.verifyOtp({
    email: email.data,
    token: code.data,
    type: "email",
  });
  if (error) return { step: "code", email: email.data, error: INVALID_CODE };

  redirect("/");
}
