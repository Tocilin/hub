import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EmptyState, ErrorState } from "./status-states";

describe("status states", () => {
  it("renders an empty state as plain content", () => {
    render(<EmptyState title="No items yet" description="Add one to get started." />);
    expect(screen.getByRole("heading", { name: "No items yet" })).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("announces an error state with its action", () => {
    render(<ErrorState title="Could not load" action={<button>Retry</button>} />);
    expect(screen.getByRole("alert")).toHaveTextContent("Could not load");
    expect(screen.getByRole("button", { name: "Retry" })).toBeInTheDocument();
  });
});
