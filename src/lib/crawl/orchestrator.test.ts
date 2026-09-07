import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readCatalog, writeCatalog } from "@/lib/store/persistence";
import { crawlPlatform, presentCatalog, screenListings } from "./orchestrator";

const now = new Date("2026-09-05T12:00:00Z");

describe("screenListings", () => {
  it("accepts clean rows and drops expired, mock, placeholder, and broken ones", () => {
    const payload = {
      jobs: [
        {
          id: 1,
          url: "https://jobicy.com/jobs/1-support-engineer",
          jobTitle: "Support Engineer",
          companyName: "Roboflow",
          jobGeo: "USA",
          pubDate: "2026-09-05T06:08:42+00:00",
          jobExcerpt: "Help customers ship computer vision.",
        },
        {
          id: 2,
          url: "https://jobicy.com/jobs/2-expired",
          jobTitle: "Expired Role",
          companyName: "Roboflow",
          jobGeo: "USA",
          pubDate: "2026-06-01T00:00:00+00:00",
          jobExcerpt: "Old listing.",
        },
        {
          id: 3,
          url: "https://jobicy.com/jobs/3-mock",
          jobTitle: "Dummy Job",
          companyName: "Acme Corp",
          jobGeo: "USA",
          pubDate: "2026-09-04T00:00:00+00:00",
          jobExcerpt: "lorem ipsum placeholder",
        },
        {
          id: 4,
          url: "https://example.com/jobs/broken",
          jobTitle: "Broken Link",
          companyName: "Roboflow",
          jobGeo: "USA",
          pubDate: "2026-09-04T00:00:00+00:00",
          jobExcerpt: "Looks real but the host is fake.",
        },
      ],
    };

    const result = screenListings("jobicy", payload, new Set(), now);
    expect(result.accepted).toHaveLength(1);
    expect(result.accepted[0]?.title).toBe("Support Engineer");
    expect(result.stats.expired).toBe(1);
    expect(result.stats.mock + result.stats.placeholder).toBeGreaterThanOrEqual(1);
    expect(result.stats.invalid + result.stats.broken).toBeGreaterThanOrEqual(1);
  });
});

describe("crawlPlatform", () => {
  it("persists only accepted listings and consumes one budget unit", async () => {
    const catalogPath = path.join(mkdtempSync(path.join(tmpdir(), "optracker-")), "catalog.json");

    const result = await crawlPlatform({
      platformId: "jobicy",
      catalogPath,
      now,
      fetchPayload: async () => ({
        jobs: [
          {
            id: 10,
            url: "https://jobicy.com/jobs/10-real-role",
            jobTitle: "Platform Engineer",
            companyName: "Linear",
            jobGeo: "Remote",
            pubDate: "2026-09-04T00:00:00+00:00",
            jobExcerpt: "Own the job integrity pipeline.",
          },
          {
            id: 11,
            url: "https://jobicy.com/jobs/11-sample",
            jobTitle: "Sample Job",
            companyName: "Example Company",
            jobGeo: "Remote",
            pubDate: "2026-09-04T00:00:00+00:00",
            jobExcerpt: "placeholder listing",
          },
        ],
      }),
    });

    expect(result.attempt.ok).toBe(true);
    expect(result.attempt.stats.accepted).toBe(1);
    expect(result.budget.used).toBe(1);
    expect(result.budget.remaining).toBe(4);
    expect(readCatalog(catalogPath).listings).toHaveLength(1);
    expect(readCatalog(catalogPath).listings[0]?.company).toBe("Linear");
  });

  it("refuses a sixth crawl on the same UTC day", async () => {
    const catalogPath = path.join(mkdtempSync(path.join(tmpdir(), "optracker-")), "catalog.json");
    const fetchPayload = async () => ({
      jobs: [
        {
          id: 20,
          url: "https://jobicy.com/jobs/20-role",
          jobTitle: "Designer",
          companyName: "Figma",
          jobGeo: "Remote",
          pubDate: "2026-09-04T00:00:00+00:00",
          jobExcerpt: "Shape the product.",
        },
      ],
    });

    for (let i = 0; i < 5; i += 1) {
      await crawlPlatform({ platformId: "jobicy", catalogPath, now, fetchPayload });
    }

    await expect(
      crawlPlatform({ platformId: "jobicy", catalogPath, now, fetchPayload }),
    ).rejects.toThrow(/limit/i);
  });

  it("serializes overlapping pulses so a fifth remaining slot cannot be spent twice", async () => {
    const catalogPath = path.join(mkdtempSync(path.join(tmpdir(), "optracker-")), "catalog.json");
    writeCatalog(
      {
        version: 1,
        updatedAt: null,
        listings: [],
        lastAttempts: [],
        budget: { date: "2026-09-05", used: 4, log: [] },
      },
      catalogPath,
    );

    const fetchPayload = async () => ({
      jobs: [
        {
          id: 30,
          url: "https://jobicy.com/jobs/30-role",
          jobTitle: "Researcher",
          companyName: "Anthropic",
          jobGeo: "Remote",
          pubDate: "2026-09-04T00:00:00+00:00",
          jobExcerpt: "Study the board.",
        },
      ],
    });

    const results = await Promise.allSettled([
      crawlPlatform({ platformId: "jobicy", catalogPath, now, fetchPayload }),
      crawlPlatform({ platformId: "jobicy", catalogPath, now, fetchPayload }),
    ]);

    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((result) => result.status === "rejected")).toHaveLength(1);
    expect(readCatalog(catalogPath).budget.used).toBe(5);
  });
});

describe("presentCatalog", () => {
  it("hides stored mock or schema-invalid rows on read", () => {
    const presented = presentCatalog(
      {
        version: 1,
        updatedAt: "2026-09-05T12:00:00.000Z",
        listings: [
          {
            id: "jobicy:1",
            platformId: "jobicy",
            platformName: "Jobicy",
            title: "Support Engineer",
            company: "Roboflow",
            location: "USA",
            workMode: "remote",
            url: "https://jobicy.com/jobs/1",
            postedAt: "2026-09-05T06:08:42.000Z",
            expiresAt: null,
            tags: ["Support"],
            salary: null,
            excerpt: "Vision tools.",
            sourceRecordId: "1",
          },
          {
            id: "mock-99",
            platformId: "jobicy",
            platformName: "Jobicy",
            title: "Dummy Job",
            company: "Acme Corp",
            location: "USA",
            workMode: "remote",
            url: "https://jobicy.com/jobs/99",
            postedAt: "2026-09-05T06:08:42.000Z",
            expiresAt: null,
            tags: ["Test"],
            salary: null,
            excerpt: "lorem ipsum",
            sourceRecordId: "99",
          },
        ],
        lastAttempts: [],
        budget: { date: "2026-09-05", used: 1, log: [] },
      },
      now,
    );

    expect(presented.listings).toHaveLength(1);
    expect(presented.listings[0]?.title).toBe("Support Engineer");
    expect(presented.hidden).toBe(1);
  });
});
