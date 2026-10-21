"use client";

import { useActionState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { login } from "./actions";
import type { LoginState } from "./schema";

const initialState: LoginState = { step: "email" };

export function LoginForm({ notice }: { notice?: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);
  const error = state.error ?? (state.step === "email" ? notice : undefined);

  return (
    <form action={formAction} className="space-y-5" noValidate>
      {state.step === "email" ? (
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            // React resets the form after each submit; keep what was typed.
            defaultValue={state.email}
            autoComplete="email"
            inputMode="email"
            required
            autoFocus
            className="h-11"
            aria-invalid={!!error || undefined}
            aria-describedby={error ? "login-error" : undefined}
          />
        </div>
      ) : (
        <div className="space-y-2">
          <input type="hidden" name="email" value={state.email} />
          <Label htmlFor="code">Sign-in code</Label>
          <p id="code-hint" className="text-sm text-muted-foreground">
            If {state.email} can use HUB, a 6-digit code is on its way.
          </p>
          <Input
            // Remount so the field is empty and focused after a new code request.
            key={state.email}
            id="code"
            name="code"
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={7}
            required
            autoFocus
            className="h-11 text-lg tracking-[0.3em]"
            aria-invalid={!!error || undefined}
            aria-describedby={error ? "code-hint login-error" : "code-hint"}
          />
        </div>
      )}

      {error && (
        <p id="login-error" role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <Button
        type="submit"
        name="intent"
        value={state.step === "email" ? "request" : "verify"}
        size="lg"
        className="h-11 w-full"
        disabled={pending}
      >
        {state.step === "email" ? "Send code" : "Sign in"}
      </Button>

      {state.step === "code" && (
        <Button
          type="submit"
          name="intent"
          value="restart"
          variant="ghost"
          size="lg"
          className="h-11 w-full"
          disabled={pending}
        >
          Use a different email
        </Button>
      )}
    </form>
  );
}
