import { presentCatalog } from "@/lib/crawl/orchestrator";
import { readCatalog } from "@/lib/store/persistence";
import type { JobListing } from "@/lib/domain/types";

export function filterCatalogListings(
  listings: JobListing[],
  options: { q?: string; platform?: string; workMode?: string },
): JobListing[] {
  const query = options.q?.trim().toLowerCase() ?? "";
  const platformId = options.platform?.trim() ?? "";
  const workMode = options.workMode?.trim() ?? "";

  return listings.filter((listing) => {
    if (platformId && listing.platformId !== platformId) {
      return false;
    }
    if (workMode && listing.workMode !== workMode) {
      return false;
    }
    if (!query) {
      return true;
    }
    const haystack =
      `${listing.title} ${listing.company} ${listing.location} ${listing.tags.join(" ")}`.toLowerCase();
    return haystack.includes(query);
  });
}

export function queryCatalog(options: {
  q?: string;
  platform?: string;
  workMode?: string;
  limit?: number;
}) {
  const presented = presentCatalog(readCatalog());
  const matched = filterCatalogListings(presented.listings, options);
  const limit = options.limit && options.limit > 0 ? options.limit : matched.length;
  return {
    listings: matched.slice(0, limit),
    total: matched.length,
    hidden: presented.hidden,
    updatedAt: presented.updatedAt,
    budget: presented.budget,
    lastAttempts: presented.lastAttempts,
  };
}
