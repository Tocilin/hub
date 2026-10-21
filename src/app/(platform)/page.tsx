import { Settings } from "lucide-react";
import Link from "next/link";

import { AppGrid } from "@/components/platform/app-grid";
import { Button } from "@/components/ui/button";
import { getLauncherApps } from "@/platform/registry";

export default function HomePage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-gutter">
      <header className="flex h-16 items-center justify-between md:h-20">
        <p className="text-lg font-semibold tracking-tight">HUB</p>
        <Button variant="ghost" size="icon-lg" className="size-11 rounded-full" asChild>
          <Link href="/settings" aria-label="Settings">
            <Settings aria-hidden="true" className="size-5" />
          </Link>
        </Button>
      </header>
      <main className="flex-1 pt-6 pb-16 md:pt-12">
        <h1 className="sr-only">Apps</h1>
        <AppGrid apps={getLauncherApps()} />
      </main>
    </div>
  );
}
