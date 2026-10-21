import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AppShell } from "./app-shell";

describe("AppShell", () => {
  it("provides a way back to HUB, the page title and content", () => {
    render(
      <AppShell
        title="Settings"
        actions={<button>Save</button>}
        nav={<nav aria-label="Sections" />}
      >
        <p>Body</p>
      </AppShell>,
    );
    expect(screen.getByRole("link", { name: "HUB" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("heading", { level: 1, name: "Settings" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Save" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Sections" })).toBeInTheDocument();
    expect(screen.getByRole("main")).toHaveTextContent("Body");
  });
});
