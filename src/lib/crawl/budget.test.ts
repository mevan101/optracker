import { describe, expect, it } from "vitest";
import { MAX_CRAWLS_PER_DAY } from "@/lib/domain/types";
import { canConsume, consumeBudget, resolveBudget } from "./budget";
import type { CatalogSnapshot } from "@/lib/domain/types";

function snapshot(date: string, used: number): CatalogSnapshot {
  return {
    version: 1,
    updatedAt: null,
    listings: [],
    lastAttempts: [],
    budget: { date, used, log: [] },
  };
}

describe("crawl budget", () => {
  it("caps usage at 5 crawls per UTC day", () => {
    const now = new Date("2026-09-05T15:00:00Z");
    const budget = resolveBudget(snapshot("2026-09-05", 5), now);
    expect(budget.limit).toBe(MAX_CRAWLS_PER_DAY);
    expect(budget.remaining).toBe(0);
    expect(canConsume(budget)).toBe(false);
  });

  it("resets on a new UTC day", () => {
    const budget = resolveBudget(
      snapshot("2026-09-04", 5),
      new Date("2026-09-05T00:01:00Z"),
    );
    expect(budget.used).toBe(0);
    expect(budget.remaining).toBe(5);
  });

  it("increments used when a crawl is consumed", () => {
    const now = new Date("2026-09-05T15:00:00Z");
    const next = consumeBudget(snapshot("2026-09-05", 2), "remoteok", 4, now);
    expect(next.budget.used).toBe(3);
    expect(next.budget.log[0]?.platformId).toBe("remoteok");
  });

  it("throws when the day is already exhausted", () => {
    expect(() =>
      consumeBudget(
        snapshot("2026-09-05", 5),
        "jobicy",
        0,
        new Date("2026-09-05T18:00:00Z"),
      ),
    ).toThrow(/exhausted/i);
  });
});
