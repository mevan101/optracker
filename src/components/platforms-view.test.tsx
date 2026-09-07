/** @vitest-environment happy-dom */

import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { sampleBudget, samplePlatforms } from "@/lib/client/test-fixtures";
import { emitCatalogChanged } from "@/lib/client/catalog-sync";
import { PlatformsView } from "./platforms-view";

describe("PlatformsView", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => ({
          platforms: samplePlatforms.map((platform) =>
            platform.id === "jobicy" ? { ...platform, liveCount: 50 } : platform,
          ),
          budget: sampleBudget,
        }),
      })),
    );
  });

  it("lists boards and refreshes live counts", async () => {
    render(
      <PlatformsView
        platforms={samplePlatforms.map((platform) => ({ ...platform, liveCount: 0 }))}
      />,
    );
    expect(screen.getByRole("heading", { name: "Boards" })).toBeTruthy();
    expect(screen.getByText("Jobicy")).toBeTruthy();
    expect(screen.getAllByText("Directory only").length).toBeGreaterThan(0);

    emitCatalogChanged();
    await waitFor(() => {
      expect(screen.getByText("50")).toBeTruthy();
    });
  });
});
