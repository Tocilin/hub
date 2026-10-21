import type { Metadata } from "next";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in · HUB" };

const notices: Record<string, string> = {
  unauthorized: "This account can't use HUB. Sign in with the approved email.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;
  const notice = typeof error === "string" ? notices[error] : undefined;

  return (
    <main className="grid min-h-dvh place-items-center px-gutter py-12">
      <div className="w-full max-w-sm space-y-8">
        <div className="space-y-2 text-center">
          <p className="text-sm font-semibold tracking-[0.2em] text-muted-foreground">HUB</p>
          <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
        </div>
        <div className="rounded-2xl border bg-card p-6 shadow-raised">
          <LoginForm notice={notice} />
        </div>
      </div>
    </main>
  );
}
