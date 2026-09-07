/** @vitest-environment happy-dom */

import "@/test/component-mocks";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach } from "vitest";
import { sampleListings } from "@/lib/client/test-fixtures";
import { SAVED_KEY } from "@/lib/client/saved";
import { JobDetail } from "./job-detail";

describe("JobDetail", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("shows facts, a cleaned excerpt, and toggles save", async () => {
    const user = userEvent.setup();
    render(<JobDetail listing={sampleListings[0]!} />);

    expect(screen.getByText("Roboflow")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Support Engineer" })).toBeTruthy();
    expect(screen.getByText("Location")).toBeTruthy();
    expect(screen.getByText("USA")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open on Jobicy" })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Save role" }));
    expect(screen.getByRole("button", { name: "Remove saved role" })).toBeTruthy();
    expect(localStorage.getItem(SAVED_KEY)).toContain("jobicy:1");
  });
});
