/** @vitest-environment happy-dom */

import "@/test/component-mocks";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { sampleListings } from "@/lib/client/test-fixtures";
import { SAVED_KEY } from "@/lib/client/saved";
import { JobDetail } from "./job-detail";

const fetchPokeStatus = vi.fn();
const sendPokeIntent = vi.fn();

vi.mock("@/lib/client/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/client/api")>("@/lib/client/api");
  return {
    ...actual,
    fetchPokeStatus: (...args: unknown[]) => fetchPokeStatus(...args),
    sendPokeIntent: (...args: unknown[]) => sendPokeIntent(...args),
  };
});

describe("JobDetail", () => {
  beforeEach(() => {
    localStorage.clear();
    fetchPokeStatus.mockReset();
    sendPokeIntent.mockReset();
  });

  it("shows facts, a cleaned excerpt, and toggles save", async () => {
    const user = userEvent.setup();
    render(<JobDetail listing={sampleListings[0]!} />);

    expect(screen.getByText("Roboflow")).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Support Engineer" })).toBeTruthy();
    expect(screen.getByText("Location")).toBeTruthy();
    expect(screen.getByText("USA")).toBeTruthy();
    expect(screen.getByRole("link", { name: "Open on Jobicy" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Ask Poke" })).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Save role" }));
    expect(screen.getByRole("button", { name: "Remove saved role" })).toBeTruthy();
    expect(screen.getByText("Saved")).toBeTruthy();
    expect(localStorage.getItem(SAVED_KEY)).toContain("jobicy:1");
  });

  it("reads an existing bookmark as Saved on first paint", () => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(["jobicy:1"]));
    render(<JobDetail listing={sampleListings[0]!} />);
    expect(screen.getByRole("button", { name: "Remove saved role" })).toBeTruthy();
    expect(screen.getByText("Saved")).toBeTruthy();
  });

  it("briefs Poke for the open role", async () => {
    const user = userEvent.setup();
    fetchPokeStatus.mockResolvedValue({ configured: true, mcp: true, last: null });
    sendPokeIntent.mockResolvedValue({
      configured: true,
      sent: true,
      kind: "role",
      summary: "Support Engineer at Roboflow",
    });
    render(<JobDetail listing={sampleListings[0]!} />);
    await user.click(screen.getByRole("button", { name: "Ask Poke" }));
    expect(sendPokeIntent).toHaveBeenCalledWith("role", "jobicy:1");
    expect(await screen.findByText("Poke has this role.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Sent to Poke" })).toBeTruthy();
  });
});
