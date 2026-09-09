import { randomUUID } from "node:crypto";
import { classifyListing } from "@/lib/domain/filters";
import { isAllowedPlatform, isCrawlablePlatform } from "@/lib/domain/platforms";
import {
  emptyIntegrityStats,
  MAX_ACCEPTED_PER_SOURCE,
  type CatalogSnapshot,
  type CrawlAttempt,
  type IntegrityStats,
  type JobListing,
  type RejectionReason,
} from "@/lib/domain/types";
import { validateListing } from "@/lib/domain/validation";
import { consumeBudget, resolveBudget } from "./budget";
import { withCrawlLock } from "./lock";
import { normalizeSourceRow, unwrapSourceRows } from "./normalize";
import { getSource } from "./sources";
import { readCatalog, replacePlatformListings, writeCatalog } from "@/lib/store/persistence";

export class CrawlBudgetError extends Error {
  constructor(message = "Daily crawl limit reached (5 per UTC day).") {
    super(message);
    this.name = "CrawlBudgetError";
  }
}

export class CrawlSourceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CrawlSourceError";
  }
}

export interface ScreenResult {
  accepted: JobListing[];
  stats: IntegrityStats;
}

export function screenListings(
  platformId: string,
  payload: unknown,
  knownUrls: Set<string>,
  now = new Date(),
): ScreenResult {
  const stats = emptyIntegrityStats();
  const accepted: JobListing[] = [];
  const seen = new Set<string>();
  const rows = unwrapSourceRows(payload, platformId);
  stats.fetched = rows.length;

  for (const row of rows) {
    const normalized = normalizeSourceRow(platformId, row);
    if (!normalized) {
      stats.invalid += 1;
      continue;
    }

    const validated = validateListing(normalized);
    if (!validated.ok) {
      stats.invalid += 1;
      continue;
    }

    const listing = validated.listing;
    const rejection = classifyListing(listing, now);
    if (rejection) {
      incrementReason(stats, rejection);
      continue;
    }

    if (knownUrls.has(listing.url) || seen.has(listing.url)) {
      stats.duplicate += 1;
      continue;
    }

    seen.add(listing.url);
    accepted.push(listing);
    if (accepted.length >= MAX_ACCEPTED_PER_SOURCE) {
      break;
    }
  }

  stats.accepted = accepted.length;
  return { accepted, stats };
}

function incrementReason(stats: IntegrityStats, reason: RejectionReason): void {
  if (reason === "untrusted_platform") {
    stats.untrusted_platform += 1;
    return;
  }
  stats[reason] += 1;
}

export interface CrawlOptions {
  platformId: string;
  catalogPath?: string;
  fetchPayload?: () => Promise<unknown>;
  now?: Date;
}

export interface CrawlResult {
  attempt: CrawlAttempt;
  budget: ReturnType<typeof resolveBudget>;
  listings: JobListing[];
  hidden: number;
  updatedAt: string | null;
}

export async function crawlPlatform(options: CrawlOptions): Promise<CrawlResult> {
  return withCrawlLock(() => crawlPlatformUnlocked(options));
}

async function crawlPlatformUnlocked(options: CrawlOptions): Promise<CrawlResult> {
  const now = options.now ?? new Date();
  if (!isAllowedPlatform(options.platformId)) {
    throw new CrawlSourceError("Unknown platform.");
  }
  if (!isCrawlablePlatform(options.platformId)) {
    throw new CrawlSourceError(
      "That platform is a directory destination and is not crawled.",
    );
  }

  const source = options.fetchPayload
    ? { fetchPayload: options.fetchPayload }
    : getSource(options.platformId);
  if (!source) {
    throw new CrawlSourceError("No public API adapter is registered for that platform.");
  }

  let snapshot = readCatalog(options.catalogPath);
  const budget = resolveBudget(snapshot, now);
  if (budget.remaining < 1) {
    throw new CrawlBudgetError();
  }

  const startedAt = now.toISOString();
  let payload: unknown;
  try {
    payload = await source.fetchPayload();
  } catch (error) {
    const attempt = makeAttempt({
      platformId: options.platformId,
      startedAt,
      finishedAt: new Date().toISOString(),
      ok: false,
      error: error instanceof Error ? error.message : "Source fetch failed",
      stats: emptyIntegrityStats(),
    });
    snapshot = {
      ...consumeBudget(snapshot, options.platformId, 0, now),
      lastAttempts: [attempt, ...snapshot.lastAttempts].slice(0, 20),
    };
    writeCatalog(snapshot, options.catalogPath);
    return presentCrawl(snapshot, attempt, now);
  }

  const knownUrls = new Set(
    snapshot.listings
      .filter((listing) => listing.platformId !== options.platformId)
      .map((listing) => listing.url),
  );
  const screened = screenListings(options.platformId, payload, knownUrls, now);
  const finishedAt = new Date().toISOString();
  const attempt = makeAttempt({
    platformId: options.platformId,
    startedAt,
    finishedAt,
    ok: true,
    stats: screened.stats,
  });

  snapshot = consumeBudget(snapshot, options.platformId, screened.accepted.length, now);
  snapshot = replacePlatformListings(
    snapshot,
    options.platformId,
    screened.accepted,
    attempt,
  );
  writeCatalog(snapshot, options.catalogPath);

  return presentCrawl(snapshot, attempt, now);
}

function makeAttempt(partial: Omit<CrawlAttempt, "id">): CrawlAttempt {
  return {
    id: randomUUID(),
    ...partial,
  };
}

function presentCrawl(
  snapshot: CatalogSnapshot,
  attempt: CrawlAttempt,
  now: Date,
): CrawlResult {
  const presented = presentCatalog(snapshot, now);
  return {
    attempt,
    budget: presented.budget,
    listings: presented.listings,
    hidden: presented.hidden,
    updatedAt: presented.updatedAt,
  };
}

function pulseRank(lastAttempts: CrawlAttempt[], platformId: string): number {
  const attempt = lastAttempts.find(
    (item) => item.platformId === platformId && item.ok,
  );
  if (!attempt) {
    return 0;
  }
  const time = Date.parse(attempt.finishedAt);
  return Number.isFinite(time) ? time : 0;
}

export function compareListingsForBoard(
  a: JobListing,
  b: JobListing,
  lastAttempts: CrawlAttempt[],
): number {
  const pulseDelta = pulseRank(lastAttempts, b.platformId) - pulseRank(lastAttempts, a.platformId);
  if (pulseDelta !== 0) {
    return pulseDelta;
  }
  const aTime = a.postedAt ? Date.parse(a.postedAt) : 0;
  const bTime = b.postedAt ? Date.parse(b.postedAt) : 0;
  return bTime - aTime;
}

export function presentCatalog(snapshot: CatalogSnapshot, now = new Date()) {
  const live = snapshot.listings.flatMap((listing) => {
    const validated = validateListing(listing);
    if (!validated.ok || classifyListing(validated.listing, now)) {
      return [];
    }
    return [validated.listing];
  });
  live.sort((a, b) => compareListingsForBoard(a, b, snapshot.lastAttempts));
  return {
    listings: live,
    hidden: snapshot.listings.length - live.length,
    budget: resolveBudget(snapshot, now),
    lastAttempts: snapshot.lastAttempts,
    updatedAt: snapshot.updatedAt,
  };
}
