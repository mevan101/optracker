import type { JobPlatform } from "./types";

/**
 * Curated, real job platforms only. Directory rows are official destinations.
 * API rows are the only sources the crawler is allowed to fetch.
 */
export const JOB_PLATFORMS: JobPlatform[] = [
  {
    id: "remoteok",
    name: "Remote OK",
    url: "https://remoteok.com",
    homeUrl: "https://remoteok.com/remote-jobs",
    description: "Public remote job board with an official JSON feed.",
    kind: "api",
    crawlable: true,
    attribution: "Listings credited to Remote OK with a follow link to the source.",
  },
  {
    id: "remotive",
    name: "Remotive",
    url: "https://remotive.com",
    homeUrl: "https://remotive.com/remote-jobs",
    description: "Remote roles published through Remotive's public jobs API.",
    kind: "api",
    crawlable: true,
    attribution: "Listings credited to Remotive with a link to the original post.",
  },
  {
    id: "arbeitnow",
    name: "Arbeitnow",
    url: "https://www.arbeitnow.com",
    homeUrl: "https://www.arbeitnow.com/jobs",
    description: "European and remote roles from Arbeitnow's public job-board API.",
    kind: "api",
    crawlable: true,
    attribution: "Listings credited to Arbeitnow with a link to the original post.",
  },
  {
    id: "jobicy",
    name: "Jobicy",
    url: "https://jobicy.com",
    homeUrl: "https://jobicy.com/remote-jobs",
    description: "Remote and hybrid roles from Jobicy's documented public API.",
    kind: "api",
    crawlable: true,
    attribution: "Listings credited to Jobicy with a link to the original post.",
  },
  {
    id: "linkedin",
    name: "LinkedIn Jobs",
    url: "https://www.linkedin.com",
    homeUrl: "https://www.linkedin.com/jobs",
    description: "Official LinkedIn jobs destination. Not crawled — open the board directly.",
    kind: "directory",
    crawlable: false,
    attribution: "Directory destination only.",
  },
  {
    id: "indeed",
    name: "Indeed",
    url: "https://www.indeed.com",
    homeUrl: "https://www.indeed.com",
    description: "Official Indeed destination. Not crawled — open the board directly.",
    kind: "directory",
    crawlable: false,
    attribution: "Directory destination only.",
  },
  {
    id: "wellfound",
    name: "Wellfound",
    url: "https://wellfound.com",
    homeUrl: "https://wellfound.com/jobs",
    description: "Startup roles on Wellfound. Directory destination only.",
    kind: "directory",
    crawlable: false,
    attribution: "Directory destination only.",
  },
  {
    id: "weworkremotely",
    name: "We Work Remotely",
    url: "https://weworkremotely.com",
    homeUrl: "https://weworkremotely.com",
    description: "Remote-first board. Directory destination only.",
    kind: "directory",
    crawlable: false,
    attribution: "Directory destination only.",
  },
  {
    id: "ashby",
    name: "Ashby",
    url: "https://www.ashbyhq.com",
    homeUrl: "https://www.ashbyhq.com",
    description: "Company career boards powered by Ashby. Directory destination only.",
    kind: "directory",
    crawlable: false,
    attribution: "Directory destination only.",
  },
  {
    id: "greenhouse",
    name: "Greenhouse",
    url: "https://www.greenhouse.com",
    homeUrl: "https://www.greenhouse.com",
    description: "Company career boards powered by Greenhouse. Directory destination only.",
    kind: "directory",
    crawlable: false,
    attribution: "Directory destination only.",
  },
];

const byId = new Map(JOB_PLATFORMS.map((platform) => [platform.id, platform]));

export function getPlatform(id: string): JobPlatform | undefined {
  return byId.get(id);
}

export function getCrawlablePlatforms(): JobPlatform[] {
  return JOB_PLATFORMS.filter((platform) => platform.crawlable);
}

export function isAllowedPlatform(id: string): boolean {
  return byId.has(id);
}

export function isCrawlablePlatform(id: string): boolean {
  return byId.get(id)?.crawlable === true;
}
