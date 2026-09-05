import { describe, expect, it } from "vitest";
import type { JobListing } from "@/lib/domain/types";
import { filterListings } from "./filter-listings";

const listings: JobListing[] = [
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
    id: "arbeitnow:2",
    platformId: "arbeitnow",
    platformName: "Arbeitnow",
    title: "Studio Designer",
    company: "Linear",
    location: "Berlin",
    workMode: "hybrid",
    url: "https://www.arbeitnow.com/jobs/2",
    postedAt: "2026-09-04T06:08:42.000Z",
    expiresAt: null,
    tags: ["Design"],
    salary: null,
    excerpt: "Shape the product.",
    sourceRecordId: "2",
  },
];

describe("filterListings", () => {
  it("filters by work mode and query without network", () => {
    expect(filterListings(listings, "", "all")).toHaveLength(2);
    expect(filterListings(listings, "", "remote")).toHaveLength(1);
    expect(filterListings(listings, "robo", "all")[0]?.company).toBe("Roboflow");
    expect(filterListings(listings, "zzzz", "all")).toHaveLength(0);
  });
});
