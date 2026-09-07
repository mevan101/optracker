import { DiscoverView } from "@/components/discover-view";
import { presentCatalog } from "@/lib/crawl/orchestrator";
import { readCatalog } from "@/lib/store/persistence";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function HomePage() {
  const presented = presentCatalog(readCatalog());
  return (
    <DiscoverView
      initial={{
        listings: presented.listings,
        total: presented.listings.length,
        hidden: presented.hidden,
        updatedAt: presented.updatedAt,
        budget: presented.budget,
      }}
    />
  );
}
