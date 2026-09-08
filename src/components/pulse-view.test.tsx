/** @vitest-environment happy-dom */

import "@/test/component-mocks";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { sampleBudget, samplePlatforms } from "@/lib/client/test-fixtures";
import { PulseView } from "./pulse-view";

const pulsePlatform = vi.fn();
const fetchPlatforms = vi.fn();

vi.mock("@/lib/client/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/client/api")>("@/lib/client/api");
  return {
    ...actual,
    pulsePlatform: (...args: unknown[]) => pulsePlatform(...args),
    fetchPlatforms: (...args: unknown[]) => fetchPlatforms(...args),
  };
});

describe("PulseView", () => {
  beforeEach(() => {
    pulsePlatform.mockReset();
    fetchPlatforms.mockReset();
    fetchPlatforms.mockResolvedValue({
      platforms: samplePlatforms.map((platform) =>
        platform.id === "remotive" ? { ...platform, liveCount: 12 } : platform,
      ),
      budget: { ...sampleBudget, used: 2, remaining: 3 },
    });
  });

  it("pulses a source and updates remaining + live counts", async () => {
    const user = userEvent.setup();
    pulsePlatform.mockResolvedValue({
      attempt: {
        id: "a1",
        platformId: "remotive",
        startedAt: "2026-09-07T01:00:00.000Z",
        finishedAt: "2026-09-07T01:00:02.000Z",
        ok: true,
        stats: {
          fetched: 20,
          accepted: 12,
          expired: 3,
          broken: 0,
          mock: 0,
          placeholder: 1,
          untrusted_platform: 0,
          duplicate: 4,
          invalid: 0,
        },
      },
      budget: { ...sampleBudget, used: 2, remaining: 3 },
      listings: Array.from({ length: 12 }, (_, index) => ({
        id: `remotive:${index}`,
        platformId: "remotive",
      })),
    });

    render(<PulseView initialPlatforms={samplePlatforms} initialBudget={sampleBudget} />);
    expect(screen.getByText("4")).toBeTruthy();

    await user.click(screen.getByRole("button", { name: "Pulse Remotive" }));

    await waitFor(() => {
      expect(screen.getByText("3")).toBeTruthy();
      expect(screen.getByText("12 live")).toBeTruthy();
      expect(screen.getByRole("link", { name: "See Remotive on Roles" }).getAttribute("href")).toBe(
        "/?board=remotive",
      );
    });
    expect(pulsePlatform).toHaveBeenCalledWith("remotive");
  });
});
