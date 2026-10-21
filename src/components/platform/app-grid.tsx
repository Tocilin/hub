import type { HubApp } from "@/platform/registry";

import { AppTile } from "./app-tile";

/** Responsive launcher grid: 3 columns on phones, 4 on tablets, 5–6 on desktop. */
export function AppGrid({ apps }: { apps: readonly HubApp[] }) {
  return (
    <ul
      aria-label="Apps"
      className="grid grid-cols-3 gap-x-2 gap-y-6 sm:grid-cols-4 sm:gap-x-4 sm:gap-y-8 lg:grid-cols-5 xl:grid-cols-6"
    >
      {apps.map((app) => (
        <li key={app.id}>
          <AppTile app={app} />
        </li>
      ))}
    </ul>
  );
}
