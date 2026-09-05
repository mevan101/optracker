import type { CrawlBudget, CrawlAttempt, IntegrityStats, JobListing, JobPlatform } from "@/lib/domain/types";

export interface JobsResponse {
  listings: JobListing[];
  total: number;
  hidden: number;
  updatedAt: string | null;
  budget: CrawlBudget;
}

export interface PlatformRow extends JobPlatform {
  liveCount: number;
}

export interface PlatformsResponse {
  platforms: PlatformRow[];
  budget: CrawlBudget;
}

export interface CrawlResponse {
  attempt?: CrawlAttempt;
  budget?: CrawlBudget;
  listings?: JobListing[];
  error?: string;
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
