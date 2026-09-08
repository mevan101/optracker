import type { Metadata } from "next";
import { PulseView } from "@/components/pulse-view";
import { presentCatalog } from "@/lib/crawl/orchestrator";
import { toPlatformRows } from "@/lib/crawl/present-platforms";
import { readCatalog } from "@/lib/store/persistence";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = { title: "Pulse" };

export default function PulsePage() {
  const presented = presentCatalog(readCatalog());
  return (
    <PulseView
      initialPlatforms={toPlatformRows(presented.listings, presented.lastAttempts)}
      initialBudget={presented.budget}
    />
  );
}
