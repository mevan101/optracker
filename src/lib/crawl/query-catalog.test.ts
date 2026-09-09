import { describe, expect, it } from "vitest";
import { sampleListings } from "@/lib/client/test-fixtures";
import { filterCatalogListings } from "./query-catalog";

describe("filterCatalogListings", () => {
  it("matches the public jobs query contract", () => {
    expect(filterCatalogListings(sampleListings, { q: "gitlab" }).map((row) => row.id)).toEqual([
      "jobicy:2",
    ]);
    expect(filterCatalogListings(sampleListings, { workMode: "hybrid" }).map((row) => row.id)).toEqual(
      ["arbeitnow:3"],
    );
    expect(filterCatalogListings(sampleListings, { platform: "jobicy" })).toHaveLength(2);
  });
});
