import type { CrawlBudget, CrawlAttempt, IntegrityStats, JobListing, JobPlatform } from "@/lib/domain/types";

export interface JobsResponse {
  listings: JobListing[];
  total: number;
  hidden: number;
  updatedAt: string | null;
  budget: CrawlBudget;
}

export interface PlatformAttempt {
  at: string;
  ok: boolean;
  accepted: number;
  error?: string;
}

export interface PlatformRow extends JobPlatform {
  liveCount: number;
  lastAttempt: PlatformAttempt | null;
}

export interface PlatformsResponse {
  platforms: PlatformRow[];
  budget: CrawlBudget;
}

export interface CrawlResponse {
  attempt?: CrawlAttempt;
  budget?: CrawlBudget;
  listings?: JobListing[];
  hidden?: number;
  updatedAt?: string | null;
  error?: string;
  poke?: PokeSendState;
}

export interface PokeSendState {
  configured: boolean;
  sent: boolean;
  kind?: "pulse" | "role" | "test";
  summary?: string;
  error?: string;
}

export interface PokeStatusResponse {
  configured: boolean;
  mcp: boolean;
  last: {
    at: string;
    ok: boolean;
    kind: "pulse" | "role" | "test";
    summary: string;
    error?: string;
  } | null;
}

export async function fetchJobs(params: {
  q?: string;
  platform?: string;
  workMode?: string;
} = {}): Promise<JobsResponse> {
  const search = new URLSearchParams();
  if (params.q) search.set("q", params.q);
  if (params.platform) search.set("platform", params.platform);
  if (params.workMode) search.set("workMode", params.workMode);
  const suffix = search.toString() ? `?${search}` : "";
  const response = await fetch(`/api/jobs${suffix}`, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("The catalog could not be loaded.");
  }
  return response.json();
}

export async function fetchPlatforms(): Promise<PlatformsResponse> {
  const response = await fetch("/api/platforms", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Platforms could not be loaded.");
  }
  return response.json();
}

export async function pulsePlatform(platformId?: string): Promise<CrawlResponse> {
  const response = await fetch("/api/crawl", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(platformId ? { platformId } : {}),
  });
  const json = (await response.json()) as CrawlResponse;
  if (!response.ok) {
    throw new Error(json.error ?? "Pulse was refused.");
  }
  return json;
}

export async function fetchPokeStatus(): Promise<PokeStatusResponse> {
  const response = await fetch("/api/poke", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Poke status is unavailable.");
  }
  return response.json();
}

export async function sendPokeIntent(
  intent: "test" | "role",
  listingId?: string,
): Promise<PokeSendState> {
  const response = await fetch("/api/poke", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(listingId ? { intent, listingId } : { intent }),
  });
  const json = (await response.json()) as PokeSendState & { error?: string };
  if (!response.ok) {
    throw new Error(json.error ?? "Poke could not be reached.");
  }
  return json;
}

export function formatIntegrity(stats?: IntegrityStats): string {
  if (!stats) {
    return "No pulse yet";
  }
  const rejected =
    stats.expired +
    stats.broken +
    stats.mock +
    stats.placeholder +
    stats.invalid +
    stats.duplicate;
  return `${stats.accepted} kept · ${rejected} filtered`;
}

export function jobsFromCrawl(result: CrawlResponse): JobsResponse | null {
  if (!result.listings || !result.budget) {
    return null;
  }
  return {
    listings: result.listings,
    total: result.listings.length,
    hidden: result.hidden ?? 0,
    updatedAt: result.attempt?.finishedAt ?? result.updatedAt ?? null,
    budget: result.budget,
  };
}
