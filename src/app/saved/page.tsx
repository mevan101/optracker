import { SavedView } from "@/components/saved-view";
import { presentCatalog } from "@/lib/crawl/orchestrator";
import { readCatalog } from "@/lib/store/persistence";

export const dynamic = "force-dynamic";

export default function SavedPage() {
  const { listings } = presentCatalog(readCatalog());
  return <SavedView listings={listings} />;
}
