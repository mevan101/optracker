import { queryCatalog } from "@/lib/crawl/query-catalog";
import { jsonNoStore } from "@/lib/http/no-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET(request: Request) {
  const url = new URL(request.url);
  const presented = queryCatalog({
    q: url.searchParams.get("q") ?? "",
    platform: url.searchParams.get("platform") ?? "",
    workMode: url.searchParams.get("workMode") ?? "",
  });

  return jsonNoStore({
    listings: presented.listings,
    total: presented.total,
    hidden: presented.hidden,
    updatedAt: presented.updatedAt,
    budget: presented.budget,
  });
}
