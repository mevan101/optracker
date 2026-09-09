import type { JobsResponse, PlatformRow } from "@/lib/client/api";
import type { CrawlBudget, JobListing } from "@/lib/domain/types";
import { JOB_PLATFORMS } from "@/lib/domain/platforms";
import { MAX_CRAWLS_PER_DAY } from "@/lib/domain/types";

export function listing(partial: Partial<JobListing> & Pick<JobListing, "id" | "title" | "company">): JobListing {
  return {
    platformId: "jobicy",
    platformName: "Jobicy",
    location: "USA",
    workMode: "remote",
    url: `https://jobicy.com/jobs/${partial.id}`,
    postedAt: "2026-09-05T06:08:42.000Z",
    expiresAt: null,
    tags: ["Support"],
    salary: null,
    excerpt: "Help customers ship.",
    sourceRecordId: partial.id,
    ...partial,
  };
}

export const sampleListings: JobListing[] = [
  listing({ id: "jobicy:1", title: "Support Engineer", company: "Roboflow" }),
  listing({
    id: "jobicy:2",
    title: "Area Vice President",
    company: "GitLab",
    tags: ["Sales"],
  }),
  listing({
    id: "arbeitnow:3",
    platformId: "arbeitnow",
    platformName: "Arbeitnow",
    title: "Studio Designer",
    company: "Linear",
    location: "Berlin",
    workMode: "hybrid",
    url: "https://www.arbeitnow.com/jobs/3",
    tags: ["Design"],
  }),
];

export const sampleBudget: CrawlBudget = {
  date: "2026-09-07",
  used: 1,
  limit: MAX_CRAWLS_PER_DAY,
  remaining: 4,
  log: [{ at: "2026-09-07T01:00:00.000Z", platformId: "jobicy", accepted: 2 }],
};

export function jobsResponse(listings = sampleListings): JobsResponse {
  return {
    listings,
    total: listings.length,
    hidden: 0,
    updatedAt: "2026-09-07T01:00:00.000Z",
    budget: sampleBudget,
  };
}

export const samplePlatforms: PlatformRow[] = JOB_PLATFORMS.map((platform) => ({
  ...platform,
  liveCount: platform.id === "jobicy" ? 2 : 0,
  lastAttempt:
    platform.id === "jobicy"
      ? {
          at: "2026-09-07T01:00:00.000Z",
          ok: true,
          accepted: 2,
        }
      : null,
}));
