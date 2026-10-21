import { render, screen, within } from "@testing-library/react";
import { Wallet } from "lucide-react";
import { describe, expect, it } from "vitest";

import type { HubApp } from "@/platform/registry";

import { AppGrid } from "./app-grid";
import { AppTile } from "./app-tile";

const app = (overrides: Partial<HubApp>): HubApp => ({
  id: "finance",
  name: "Finance",
  description: "Accounts and budgets",
  icon: Wallet,
  color: "green",
  status: "active",
  ...overrides,
});

describe("AppTile", () => {
  it("links an active app to its route", () => {
    render(<AppTile app={app({})} />);
    const link = screen.getByRole("link", { name: /Finance/ });
    expect(link).toHaveAttribute("href", "/apps/finance");
    expect(screen.queryByText("Soon")).not.toBeInTheDocument();
  });

  it("renders a coming-soon app as non-interactive and says so", () => {
    render(<AppTile app={app({ status: "coming-soon" })} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.getByText("Finance")).toBeInTheDocument();
    expect(screen.getByText("(coming soon)")).toHaveClass("sr-only");
    expect(screen.getByText("Soon")).toHaveAttribute("aria-hidden", "true");
  });
});

describe("AppGrid", () => {
  it("renders one list item per app, in order", () => {
    render(
      <AppGrid
        apps={[
          app({ id: "a", name: "Alpha" }),
          app({ id: "b", name: "Beta", status: "coming-soon" }),
        ]}
      />,
    );
    const items = within(screen.getByRole("list", { name: "Apps" })).getAllByRole("listitem");
    expect(items.map((item) => item.textContent)).toEqual([
      expect.stringContaining("Alpha"),
      expect.stringContaining("Beta"),
    ]);
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});
