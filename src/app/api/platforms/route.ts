import { presentCatalog } from "@/lib/crawl/orchestrator";
import { toPlatformRows } from "@/lib/crawl/present-platforms";
import { jsonNoStore } from "@/lib/http/no-store";
import { readCatalog } from "@/lib/store/persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  const presented = presentCatalog(readCatalog());
  return jsonNoStore({
    platforms: toPlatformRows(presented.listings, presented.lastAttempts),
    budget: presented.budget,
  });
}
