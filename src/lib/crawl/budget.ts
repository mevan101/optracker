import { MAX_CRAWLS_PER_DAY, type CatalogSnapshot, type CrawlBudget } from "@/lib/domain/types";
import { utcDay } from "@/lib/domain/text";

export function resolveBudget(
  snapshot: CatalogSnapshot,
  now = new Date(),
): CrawlBudget {
  const today = utcDay(now);
  const sameDay = snapshot.budget.date === today;
  const used = sameDay ? snapshot.budget.used : 0;
  const log = sameDay ? snapshot.budget.log : [];

  return {
    date: today,
    used,
    limit: MAX_CRAWLS_PER_DAY,
    remaining: Math.max(0, MAX_CRAWLS_PER_DAY - used),
    log,
  };
}

export function canConsume(budget: CrawlBudget, count = 1): boolean {
  return count > 0 && budget.remaining >= count;
}

export function consumeBudget(
  snapshot: CatalogSnapshot,
  platformId: string,
  accepted: number,
  now = new Date(),
): CatalogSnapshot {
  const budget = resolveBudget(snapshot, now);
  if (!canConsume(budget)) {
    throw new Error("Daily crawl budget exhausted");
  }

  return {
    ...snapshot,
    budget: {
      date: budget.date,
      used: budget.used + 1,
      log: [
        { at: now.toISOString(), platformId, accepted },
        ...budget.log,
      ].slice(0, 40),
    },
  };
}
