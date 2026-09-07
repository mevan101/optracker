import { describe, expect, it } from "vitest";
import { filterListings } from "@/lib/client/filter-listings";
import { SAVED_KEY } from "@/lib/client/saved";
import { getCrawlablePlatforms, JOB_PLATFORMS } from "@/lib/domain/platforms";
import { MAX_CRAWLS_PER_DAY } from "@/lib/domain/types";
import { sampleListings } from "@/lib/client/test-fixtures";

/**
 * Contracts that have been true since the first working site (b71f789)
 * through the editorial rebuild. Past versions must keep working.
 */
describe("site version contracts", () => {
  it("still exposes the original four crawlable APIs and directory boards", () => {
    expect(getCrawlablePlatforms().map((platform) => platform.id)).toEqual([
      "remoteok",
      "remotive",
      "arbeitnow",
      "jobicy",
    ]);
    expect(JOB_PLATFORMS.some((platform) => platform.id === "linkedin" && !platform.crawlable)).toBe(
      true,
    );
    expect(JOB_PLATFORMS).toHaveLength(10);
  });

  it("still caps pulses at five per UTC day", () => {
    expect(MAX_CRAWLS_PER_DAY).toBe(5);
  });

  it("still stores bookmarks under the original localStorage key", () => {
    expect(SAVED_KEY).toBe("optracker:saved");
  });

  it("still filters locally the way the 60fps board did", () => {
    expect(filterListings(sampleListings, "gitlab", "all")).toHaveLength(1);
    expect(filterListings(sampleListings, "", "hybrid")).toHaveLength(1);
    expect(filterListings(sampleListings, "", "all", "arbeitnow")).toHaveLength(1);
  });

  it("never treats directory hosts as crawl sources", () => {
    for (const platform of JOB_PLATFORMS.filter((item) => !item.crawlable)) {
      expect(platform.kind).toBe("directory");
    }
  });
});
