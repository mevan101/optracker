import { describe, expect, it } from "vitest";
import { classifyListing, looksExpired, looksMock, looksPlaceholder } from "./filters";
import type { JobListing } from "./types";

function listing(overrides: Partial<JobListing> = {}): JobListing {
  return {
    id: "jobicy:1",
    platformId: "jobicy",
    platformName: "Jobicy",
    title: "Support Engineer",
    company: "Roboflow",
    location: "USA",
    workMode: "remote",
    url: "https://jobicy.com/jobs/152566-support-engineer",
    postedAt: "2026-09-05T06:08:42.000Z",
    expiresAt: null,
    tags: ["Support"],
    salary: null,
    excerpt: "Build tools for computer vision.",
    sourceRecordId: "1",
    ...overrides,
  };
}

describe("listing integrity filters", () => {
  it("keeps a clean current listing", () => {
    expect(classifyListing(listing(), new Date("2026-09-05T12:00:00Z"))).toBeNull();
  });

  it("rejects expired dates and closed-role language", () => {
    expect(
      looksExpired(
        listing({ expiresAt: "2026-09-01T00:00:00.000Z" }),
        new Date("2026-09-05T00:00:00Z"),
      ),
    ).toBe(true);
    expect(
      looksExpired(listing({ excerpt: "This role is closed. Position filled." })),
    ).toBe(true);
    expect(
      looksExpired(
        listing({ postedAt: "2026-06-01T00:00:00.000Z" }),
        new Date("2026-09-05T00:00:00Z"),
      ),
    ).toBe(true);
  });

  it("rejects mock and placeholder copy", () => {
    expect(looksMock(listing({ company: "Acme Corp", title: "Dummy Job" }))).toBe(
      true,
    );
    expect(
      looksPlaceholder(listing({ title: "Placeholder Role", excerpt: "lorem ipsum" })),
    ).toBe(true);
    expect(classifyListing(listing({ id: "mock-123" }))).toBe("mock");
  });

  it("rejects broken urls and empty titles", () => {
    expect(classifyListing(listing({ url: "javascript:alert(1)" }))).toBe("broken");
    expect(classifyListing(listing({ title: "N/A" }))).toBe("broken");
  });
});
