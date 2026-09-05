import { NextResponse } from "next/server";
import { JOB_PLATFORMS } from "@/lib/domain/platforms";
import { presentCatalog } from "@/lib/crawl/orchestrator";
import { readCatalog } from "@/lib/store/persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const presented = presentCatalog(readCatalog());
  const counts = new Map<string, number>();
  for (const listing of presented.listings) {
    counts.set(listing.platformId, (counts.get(listing.platformId) ?? 0) + 1);
  }

  return NextResponse.json({
    platforms: JOB_PLATFORMS.map((platform) => ({
      ...platform,
      liveCount: counts.get(platform.id) ?? 0,
    })),
    budget: presented.budget,
  });
}
