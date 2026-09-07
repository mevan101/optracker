export const MAX_CRAWLS_PER_DAY = 5;
export const MAX_LISTING_AGE_DAYS = 45;
export const MAX_ACCEPTED_PER_SOURCE = 60;

export type WorkMode = "remote" | "hybrid" | "onsite" | "unknown";

export type RejectionReason =
  | "expired"
  | "broken"
  | "mock"
  | "placeholder"
  | "untrusted_platform"
  | "duplicate"
  | "invalid";

export type PlatformKind = "api" | "directory";

export interface JobPlatform {
  id: string;
  name: string;
  url: string;
  homeUrl: string;
  description: string;
  kind: PlatformKind;
  crawlable: boolean;
  attribution: string;
}

export interface JobListing {
  id: string;
  platformId: string;
  platformName: string;
  title: string;
  company: string;
  location: string;
  workMode: WorkMode;
  url: string;
  postedAt: string | null;
  expiresAt: string | null;
  tags: string[];
  salary: string | null;
  excerpt: string;
  sourceRecordId: string;
}

export interface IntegrityStats {
  fetched: number;
  accepted: number;
  expired: number;
  broken: number;
  mock: number;
  placeholder: number;
  untrusted_platform: number;
  duplicate: number;
  invalid: number;
}

export interface CrawlAttempt {
  id: string;
  platformId: string;
  startedAt: string;
  finishedAt: string;
  ok: boolean;
  error?: string;
  stats: IntegrityStats;
}

export interface CrawlBudget {
  date: string;
  used: number;
  limit: typeof MAX_CRAWLS_PER_DAY;
  remaining: number;
  log: Array<{
    at: string;
    platformId: string;
    accepted: number;
  }>;
}

export interface CatalogSnapshot {
  version: 1;
  updatedAt: string | null;
  listings: JobListing[];
  lastAttempts: CrawlAttempt[];
  budget: {
    date: string;
    used: number;
    log: CrawlBudget["log"];
  };
}

export function emptyIntegrityStats(): IntegrityStats {
  return {
    fetched: 0,
    accepted: 0,
    expired: 0,
    broken: 0,
    mock: 0,
    placeholder: 0,
    untrusted_platform: 0,
    duplicate: 0,
    invalid: 0,
  };
}

export function addIntegrity(
  target: IntegrityStats,
  source: IntegrityStats,
): IntegrityStats {
  return {
    fetched: target.fetched + source.fetched,
    accepted: target.accepted + source.accepted,
    expired: target.expired + source.expired,
    broken: target.broken + source.broken,
    mock: target.mock + source.mock,
    placeholder: target.placeholder + source.placeholder,
    untrusted_platform: target.untrusted_platform + source.untrusted_platform,
    duplicate: target.duplicate + source.duplicate,
    invalid: target.invalid + source.invalid,
  };
}
