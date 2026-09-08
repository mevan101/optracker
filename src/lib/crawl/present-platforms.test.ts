import { describe, expect, it } from "vitest";
import { toPlatformRows } from "./present-platforms";
import { sampleListings } from "@/lib/client/test-fixtures";
import type { CrawlAttempt } from "@/lib/domain/types";
import { emptyIntegrityStats } from "@/lib/domain/types";

describe("toPlatformRows", () => {
  it("attaches live counts and the latest attempt per board", () => {
    const attempts: CrawlAttempt[] = [
      {
        id: "a1",
        platformId: "jobicy",
        startedAt: "2026-09-07T01:00:00.000Z",
        finishedAt: "2026-09-07T01:00:02.000Z",
        ok: true,
        stats: { ...emptyIntegrityStats(), accepted: 2, fetched: 2 },
      },
    ];
    const rows = toPlatformRows(sampleListings, attempts);
    const jobicy = rows.find((row) => row.id === "jobicy");
    const remoteok = rows.find((row) => row.id === "remoteok");
    expect(jobicy?.liveCount).toBe(2);
    expect(jobicy?.lastAttempt?.ok).toBe(true);
    expect(remoteok?.liveCount).toBe(0);
    expect(remoteok?.lastAttempt).toBeNull();
  });
});
