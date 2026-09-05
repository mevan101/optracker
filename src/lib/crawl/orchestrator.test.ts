import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readCatalog } from "@/lib/store/persistence";
import { crawlPlatform, screenListings } from "./orchestrator";

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
});
