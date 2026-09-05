import { NextResponse } from "next/server";
import { presentCatalog } from "@/lib/crawl/orchestrator";
import { readCatalog } from "@/lib/store/persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const url = new URL(request.url);
  const query = url.searchParams.get("q")?.trim().toLowerCase() ?? "";
  const platformId = url.searchParams.get("platform")?.trim() ?? "";
  const workMode = url.searchParams.get("workMode")?.trim() ?? "";

  const presented = presentCatalog(readCatalog());
  const listings = presented.listings.filter((listing) => {
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

  return NextResponse.json({
    listings,
    total: listings.length,
    hidden: presented.hidden,
    updatedAt: presented.updatedAt,
    budget: presented.budget,
  });
}
