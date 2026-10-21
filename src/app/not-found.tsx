import { Compass } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/platform/status-states";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="This page doesn't exist, or the app isn't available yet."
        action={
          <Button size="lg" asChild>
            <Link href="/">Back to HUB</Link>
          </Button>
        }
      />
    </main>
  );
}
