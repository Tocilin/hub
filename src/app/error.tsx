"use client";

import { ErrorState } from "@/components/platform/status-states";
import { Button } from "@/components/ui/button";

export default function RootError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-dvh place-items-center">
      <ErrorState
        title="Something went wrong"
        description="Please try again. If it keeps happening, check the server logs."
        action={
          <Button size="lg" onClick={reset}>
            Try again
          </Button>
        }
      />
    </main>
  );
}
