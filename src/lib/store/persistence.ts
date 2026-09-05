import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import type { CatalogSnapshot, CrawlAttempt, JobListing } from "@/lib/domain/types";
import { utcDay } from "@/lib/domain/text";

const DEFAULT_PATH = path.join(process.cwd(), "data", "catalog.json");

function emptySnapshot(): CatalogSnapshot {
  return {
    version: 1,
    updatedAt: null,
    listings: [],
    lastAttempts: [],
    budget: {
      date: utcDay(),
      used: 0,
      log: [],
    },
  };
}

export function readCatalog(filePath = DEFAULT_PATH): CatalogSnapshot {
  try {
    const raw = readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as CatalogSnapshot;
    if (parsed?.version !== 1 || !Array.isArray(parsed.listings)) {
      return emptySnapshot();
    }
    return {
      ...emptySnapshot(),
      ...parsed,
      listings: parsed.listings,
      lastAttempts: Array.isArray(parsed.lastAttempts) ? parsed.lastAttempts : [],
      budget: {
        date: parsed.budget?.date ?? utcDay(),
        used: Number(parsed.budget?.used ?? 0),
        log: Array.isArray(parsed.budget?.log) ? parsed.budget.log : [],
      },
    };
  } catch {
    return emptySnapshot();
  }
}

export function writeCatalog(
  snapshot: CatalogSnapshot,
  filePath = DEFAULT_PATH,
): void {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");
}

export function replacePlatformListings(
  current: CatalogSnapshot,
  platformId: string,
  nextListings: JobListing[],
  attempt: CrawlAttempt,
): CatalogSnapshot {
  const retained = current.listings.filter((listing) => listing.platformId !== platformId);
  const attempts = [
    attempt,
    ...current.lastAttempts.filter((item) => item.platformId !== platformId),
  ].slice(0, 20);

  return {
    ...current,
    updatedAt: attempt.finishedAt,
    listings: [...nextListings, ...retained],
    lastAttempts: attempts,
  };
}

export function defaultCatalogPath(): string {
  return DEFAULT_PATH;
}
