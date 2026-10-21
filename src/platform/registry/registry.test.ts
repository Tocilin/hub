import { Wallet } from "lucide-react";
import { describe, expect, it } from "vitest";

import { apps } from "./apps";
import { appPath, getActiveApp, getLauncherApps, type HubApp, validateRegistry } from "./index";

const app = (overrides: Partial<HubApp>): HubApp => ({
  id: "sample",
  name: "Sample",
  icon: Wallet,
  color: "blue",
  status: "active",
  ...overrides,
});

describe("app registry", () => {
  it("is valid", () => {
    expect(validateRegistry(apps)).toEqual([]);
  });

  it("ships no launchable apps in Phase 1", () => {
    expect(apps.filter((entry) => entry.status === "active")).toEqual([]);
  });
});

describe("validateRegistry", () => {
  it("flags duplicate ids, bad ids, empty names and unknown colors", () => {
    const problems = validateRegistry([
      app({ id: "notes" }),
      app({ id: "notes" }),
      app({ id: "My App" }),
      app({ id: "blank", name: "  " }),
      app({ id: "neon", color: "neon" as HubApp["color"] }),
    ]);

    expect(problems).toEqual([
      '"notes": duplicate id',
      '"My App": id must be kebab-case',
      '"blank": name is empty',
      '"neon": unknown color "neon"',
    ]);
  });
});

describe("registry helpers", () => {
  const registry = [
    app({ id: "live" }),
    app({ id: "later", status: "coming-soon" }),
    app({ id: "secret", status: "hidden" }),
  ];

  it("derives the path from the id", () => {
    expect(appPath({ id: "meal-plan" })).toBe("/apps/meal-plan");
  });

  it("shows active and coming-soon apps on the launcher, in order", () => {
    expect(getLauncherApps(registry).map((entry) => entry.id)).toEqual(["live", "later"]);
  });

  it("only resolves launchable apps", () => {
    expect(getActiveApp("live", registry)?.id).toBe("live");
    expect(getActiveApp("later", registry)).toBeUndefined();
    expect(getActiveApp("secret", registry)).toBeUndefined();
    expect(getActiveApp("missing", registry)).toBeUndefined();
  });
});
