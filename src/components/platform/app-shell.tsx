import { ChevronLeft } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

type AppShellProps = {
  title: string;
  /** App identity shown next to the title, e.g. `<AppIcon app={app} size="sm" />`. */
  identity?: React.ReactNode;
  /** App-level navigation (tabs, links), rendered under the header. */
  nav?: React.ReactNode;
  /** Contextual actions at the trailing edge of the header. */
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

/**
 * Optional shell for apps and platform pages: back to HUB, identity, nav slot, actions.
 * Apps with their own layout don't have to use it.
 */
export function AppShell({ title, identity, nav, actions, children, className }: AppShellProps) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-2 px-gutter">
          <Link
            href="/"
            className="-ml-2 flex h-11 items-center gap-0.5 rounded-lg pr-2 pl-1 text-sm font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <ChevronLeft aria-hidden="true" className="size-5" />
            HUB
          </Link>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
            {identity}
            <h1 className="truncate text-base font-semibold tracking-tight">{title}</h1>
          </div>
          {/* Keeps the title centred when there are no actions. */}
          <div className="flex min-w-16 items-center justify-end gap-1">{actions}</div>
        </div>
        {nav && <div className="mx-auto max-w-5xl px-gutter">{nav}</div>}
      </header>
      <main className={cn("mx-auto w-full max-w-5xl flex-1 px-gutter py-8", className)}>
        {children}
      </main>
    </div>
  );
}
