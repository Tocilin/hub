import { apps } from "./apps";
import { appColors, type HubApp } from "./types";

export type { AppColor, AppStatus, HubApp } from "./types";

/** URL of an app. Only meaningful for `active` apps; others have no route. */
export function appPath(app: Pick<HubApp, "id">): `/apps/${string}` {
  return `/apps/${app.id}`;
}

/** Apps to show on the launcher, in display order. */
export function getLauncherApps(registry: readonly HubApp[] = apps): HubApp[] {
  return registry.filter((app) => app.status !== "hidden");
}

/** Returns the app only if it exists and is launchable. */
export function getActiveApp(id: string, registry: readonly HubApp[] = apps): HubApp | undefined {
  return registry.find((app) => app.id === id && app.status === "active");
}

const idPattern = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

/** Returns a list of problems; empty means the registry is valid. Enforced by unit tests. */
export function validateRegistry(registry: readonly HubApp[]): string[] {
  const problems: string[] = [];
  const seen = new Set<string>();

  for (const app of registry) {
    if (!idPattern.test(app.id)) problems.push(`"${app.id}": id must be kebab-case`);
    if (seen.has(app.id)) problems.push(`"${app.id}": duplicate id`);
    seen.add(app.id);
    if (!app.name.trim()) problems.push(`"${app.id}": name is empty`);
    if (!appColors.includes(app.color)) problems.push(`"${app.id}": unknown color "${app.color}"`);
  }

  return problems;
}
