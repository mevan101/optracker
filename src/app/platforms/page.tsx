import type { Metadata } from "next";
import { PlatformsView } from "@/components/platforms-view";
import { presentCatalog } from "@/lib/crawl/orchestrator";
import { toPlatformRows } from "@/lib/crawl/present-platforms";
import { readCatalog } from "@/lib/store/persistence";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = { title: "Boards" };

export default function PlatformsPage() {
  const presented = presentCatalog(readCatalog());
  return (
    <PlatformsView platforms={toPlatformRows(presented.listings, presented.lastAttempts)} />
  );
}
