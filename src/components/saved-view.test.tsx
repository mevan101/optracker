/** @vitest-environment happy-dom */

import "@/test/component-mocks";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, beforeEach, vi } from "vitest";
import { jobsResponse, sampleListings } from "@/lib/client/test-fixtures";
import { writeSavedIds } from "@/lib/client/saved";
import { SavedView } from "./saved-view";

describe("SavedView", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => jobsResponse(),
      })),
    );
  });

  it("shows the empty state, then a bookmark in realtime", async () => {
    render(<SavedView listings={sampleListings} />);
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "No saved roles" })).toBeTruthy();
    });

    writeSavedIds(["jobicy:1"]);

    await waitFor(() => {
      expect(screen.getByText("Support Engineer")).toBeTruthy();
      expect(screen.getByText("1")).toBeTruthy();
    });
  });
});
