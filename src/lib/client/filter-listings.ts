import type { JobListing } from "@/lib/domain/types";

export function filterListings(
  listings: JobListing[],
  query: string,
  workMode: string,
  platformId = "all",
): JobListing[] {
  const q = query.trim().toLowerCase();
  return listings.filter((listing) => {
    if (platformId !== "all" && listing.platformId !== platformId) {
      return false;
    }
    if (workMode !== "all" && listing.workMode !== workMode) {
      return false;
    }
    if (!q) {
      return true;
    }
    const haystack =
      `${listing.title} ${listing.company} ${listing.location} ${listing.tags.join(" ")}`.toLowerCase();
    return haystack.includes(q);
  });
}
