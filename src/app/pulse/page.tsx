import type { Metadata } from "next";
import { PulseView } from "@/components/pulse-view";
import { JOB_PLATFORMS } from "@/lib/domain/platforms";
import { presentCatalog } from "@/lib/crawl/orchestrator";
import { readCatalog } from "@/lib/store/persistence";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = { title: "Pulse" };

export default function PulsePage() {
  const presented = presentCatalog(readCatalog());
  const counts = new Map<string, number>();
  for (const listing of presented.listings) {
    counts.set(listing.platformId, (counts.get(listing.platformId) ?? 0) + 1);
  }

  return (
    <PulseView
      initialPlatforms={JOB_PLATFORMS.map((platform) => ({
        ...platform,
        liveCount: counts.get(platform.id) ?? 0,
      }))}
      initialBudget={presented.budget}
    />
  );
}
