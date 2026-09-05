import { fetchJson } from "@/lib/http/fetch-json";
import { getCrawlablePlatforms } from "@/lib/domain/platforms";

export interface CrawlSource {
  platformId: string;
  fetchPayload: () => Promise<unknown>;
}

const SOURCE_URLS: Record<string, string> = {
  remoteok: "https://remoteok.com/api",
  remotive: "https://remotive.com/api/remote-jobs",
  arbeitnow: "https://www.arbeitnow.com/api/job-board-api",
  jobicy: "https://jobicy.com/api/v2/remote-jobs?count=50",
};

export function getSource(platformId: string): CrawlSource | undefined {
  const url = SOURCE_URLS[platformId];
  if (!url) {
    return undefined;
  }
  return {
    platformId,
    fetchPayload: () => fetchJson(url),
  };
}

export function listSources(): CrawlSource[] {
  return getCrawlablePlatforms()
    .map((platform) => getSource(platform.id))
    .filter((source): source is CrawlSource => Boolean(source));
}
