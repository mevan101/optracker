/** @vitest-environment happy-dom */

import "@/test/component-mocks";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { emitCatalogChanged } from "@/lib/client/catalog-sync";
import { jobsResponse, listing, sampleListings } from "@/lib/client/test-fixtures";
import { DiscoverView } from "./discover-view";

function mockFetch(payload: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => ({
      ok: true,
      json: async () => payload,
    })),
  );
}

describe("DiscoverView", () => {
  beforeEach(() => {
    sessionStorage.clear();
    mockFetch(jobsResponse());
  });

  it("filters locally the way the first Discover board did", async () => {
    const user = userEvent.setup();
    render(<DiscoverView initial={jobsResponse()} />);

    expect(screen.getByRole("heading", { name: "Roles" })).toBeTruthy();
    expect(screen.getByText("Support Engineer")).toBeTruthy();
    expect(screen.getByText("Area Vice President")).toBeTruthy();

    await user.type(screen.getByLabelText("Search roles"), "GitLab");
    expect(screen.queryByText("Support Engineer")).toBeNull();
    expect(screen.getByText("Area Vice President")).toBeTruthy();

    await user.click(screen.getByLabelText("Clear search"));
    expect(screen.getByText("Support Engineer")).toBeTruthy();

    await user.click(screen.getByRole("tab", { name: "Hybrid" }));
    expect(screen.getByText("Studio Designer")).toBeTruthy();
    expect(screen.queryByText("Support Engineer")).toBeNull();
  });

  it("replaces the board when a live catalog event arrives", async () => {
    render(<DiscoverView initial={jobsResponse([sampleListings[0]!])} />);
    expect(screen.getByText("Support Engineer")).toBeTruthy();
    expect(screen.queryByText("New Role")).toBeNull();

    const next = jobsResponse([
      sampleListings[0]!,
      listing({ id: "jobicy:9", title: "New Role", company: "Vercel" }),
    ]);
    mockFetch(next);
    emitCatalogChanged();

    await waitFor(() => {
      expect(screen.getByText("New Role")).toBeTruthy();
    });
  });

  it("shows a load-jobs control when the board has no rows", async () => {
    mockFetch(jobsResponse([]));
    render(<DiscoverView initial={jobsResponse([])} />);
    expect(await screen.findByRole("heading", { name: "No roles yet" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Load jobs" })).toBeTruthy();
  });

  it("sends an empty spent board to Pulse instead of a dead Load jobs control", async () => {
    const empty = jobsResponse([]);
    empty.budget = { ...empty.budget, used: 5, remaining: 0 };
    mockFetch(empty);
    render(<DiscoverView initial={empty} />);
    expect(await screen.findByRole("heading", { name: "No roles yet" })).toBeTruthy();
    expect(screen.getByRole("link", { name: "Go to Pulse" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Load jobs" })).toBeNull();
  });

  it("opens on the board that was just pulsed", () => {
    render(<DiscoverView initial={jobsResponse()} focusBoard="arbeitnow" />);
    expect(screen.getByText("Studio Designer")).toBeTruthy();
    expect(screen.queryByText("Support Engineer")).toBeNull();
  });
});
