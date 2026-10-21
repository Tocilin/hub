import Link from "next/link";
import type { Route } from "next";

import { Badge } from "@/components/ui/badge";
import { appPath, type HubApp } from "@/platform/registry";
import { cn } from "@/lib/utils";

import { AppIcon } from "./app-icon";

const tileClass = "flex flex-col items-center gap-2 rounded-3xl p-2 text-center";

function TileLabel({ app, soon }: { app: HubApp; soon: boolean }) {
  return (
    <span className="flex min-w-0 flex-col items-center gap-1">
      <span className="max-w-full truncate text-sm font-medium">{app.name}</span>
      {/* Badge before the description so badges align across a row whatever the description length. */}
      {soon && (
        <Badge variant="secondary" aria-hidden="true" className="text-muted-foreground">
          Soon
        </Badge>
      )}
      {app.description && (
        <span className="hidden text-xs text-balance text-muted-foreground md:line-clamp-2">
          {app.description}
        </span>
      )}
    </span>
  );
}

/** A launcher tile. Active apps are links; unavailable apps render as plain, non-interactive content. */
export function AppTile({ app }: { app: HubApp }) {
  if (app.status !== "active") {
    return (
      <div className={cn(tileClass, "text-muted-foreground")}>
        <AppIcon app={app} className="opacity-45 saturate-50" />
        <TileLabel app={app} soon />
        <span className="sr-only">(coming soon)</span>
      </div>
    );
  }

  return (
    // appPath only produces routes for active apps, which each own a route folder.
    <Link
      href={appPath(app) as Route}
      className={cn(
        tileClass,
        "group outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
        "duration-fast transition-colors ease-standard hover:bg-accent/60",
      )}
    >
      <AppIcon
        app={app}
        className="duration-base transition-transform ease-standard group-hover:-translate-y-0.5 group-active:scale-95"
      />
      <TileLabel app={app} soon={false} />
    </Link>
  );
}
