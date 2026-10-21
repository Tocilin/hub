import type { LucideIcon } from "lucide-react";

/** App identity colors; each maps to a `--app-*` token in globals.css. */
export const appColors = ["blue", "green", "amber", "rose", "violet", "teal", "slate"] as const;
export type AppColor = (typeof appColors)[number];

/**
 * - `active`: built and launchable at `/apps/<id>`.
 * - `coming-soon`: shown on the launcher, never launchable.
 * - `hidden`: not shown anywhere (e.g. in development or retired).
 */
export type AppStatus = "active" | "coming-soon" | "hidden";

export type HubApp = {
  /** Stable kebab-case id. Also the route segment: `/apps/<id>`. Never rename once data exists. */
  id: string;
  name: string;
  /** One short line, shown on larger screens. */
  description?: string;
  icon: LucideIcon;
  color: AppColor;
  status: AppStatus;
};
