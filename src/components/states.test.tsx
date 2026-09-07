/** @vitest-environment happy-dom */

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EmptyState, ErrorState, SkeletonList } from "./states";

describe("states", () => {
  it("renders empty copy and an action", () => {
    render(<EmptyState title="No roles yet" body="Run a pulse." action={<button>Go</button>} />);
    expect(screen.getByRole("heading", { name: "No roles yet" })).toBeTruthy();
    expect(screen.getByText("Run a pulse.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Go" })).toBeTruthy();
  });

  it("retries from an error", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<ErrorState body="Down." onRetry={onRetry} />);
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("renders skeleton rows", () => {
    const { container } = render(<SkeletonList count={3} />);
    expect(container.querySelectorAll(".skeleton").length).toBeGreaterThanOrEqual(3);
  });
});
