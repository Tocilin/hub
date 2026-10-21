import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { ThemeControl } from "./theme-control";
import { ThemeProvider } from "./theme-provider";

function renderControl() {
  return render(
    <ThemeProvider>
      <ThemeControl />
    </ThemeProvider>,
  );
}

describe("ThemeControl", () => {
  it("offers light, dark and system, with system selected by default", () => {
    renderControl();
    expect(screen.getByRole("radiogroup", { name: "Theme" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Light" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("radio", { name: "Dark" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("radio", { name: "System" })).toHaveAttribute("aria-checked", "true");
  });

  it("applies and persists the chosen theme", async () => {
    const user = userEvent.setup();
    renderControl();

    await user.click(screen.getByRole("radio", { name: "Dark" }));

    expect(screen.getByRole("radio", { name: "Dark" })).toHaveAttribute("aria-checked", "true");
    expect(document.documentElement).toHaveClass("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("keeps the current theme when the active option is clicked again", async () => {
    const user = userEvent.setup();
    renderControl();

    await user.click(screen.getByRole("radio", { name: "System" }));

    expect(screen.getByRole("radio", { name: "System" })).toHaveAttribute("aria-checked", "true");
  });
});
