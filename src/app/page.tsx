import { DiscoverView } from "@/components/discover-view";
import { presentCatalog } from "@/lib/crawl/orchestrator";
import { readCatalog } from "@/lib/store/persistence";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ board?: string | string[] }>;
}) {
  const params = await searchParams;
  const board = typeof params.board === "string" ? params.board : undefined;
  const presented = presentCatalog(readCatalog());
  return (
    <DiscoverView
      focusBoard={board}
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
