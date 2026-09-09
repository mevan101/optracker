import { z } from "zod";
import {
  CrawlBudgetError,
  CrawlSourceError,
  crawlPlatform,
} from "@/lib/crawl/orchestrator";
import { resolveBudget } from "@/lib/crawl/budget";
import { getCrawlablePlatforms, getPlatform } from "@/lib/domain/platforms";
import { jsonNoStore } from "@/lib/http/no-store";
import { notifyPulse } from "@/lib/poke/client";
import { isPokeConfigured } from "@/lib/poke/config";
import { readCatalog } from "@/lib/store/persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  platformId: z.string().min(2).optional(),
});

export function GET() {
  const snapshot = readCatalog();
  return jsonNoStore({
    budget: resolveBudget(snapshot),
    lastAttempts: snapshot.lastAttempts,
    updatedAt: snapshot.updatedAt,
    listingCount: snapshot.listings.length,
    crawlable: getCrawlablePlatforms().map((platform) => platform.id),
  });
}

export async function POST(request: Request) {
  let platformId: string | undefined;
  try {
    const json = await request.json().catch(() => ({}));
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return jsonNoStore({ error: "Invalid crawl request." }, 400);
    }
    platformId = parsed.data.platformId;
  } catch {
    return jsonNoStore({ error: "Invalid crawl request." }, 400);
  }

  if (!platformId) {
    const snapshot = readCatalog();
    const budget = resolveBudget(snapshot);
    const next = getCrawlablePlatforms().find((platform) => {
      const already = snapshot.lastAttempts.some(
        (attempt) => attempt.platformId === platform.id && attempt.ok,
      );
      return !already;
    }) ?? getCrawlablePlatforms()[0];

    if (!next || budget.remaining < 1) {
      return jsonNoStore(
        { error: "Daily crawl limit reached (5 per UTC day).", budget },
        429,
      );
    }
    platformId = next.id;
  }

  try {
    const result = await crawlPlatform({ platformId });
    const poke = result.attempt.ok
      ? await notifyPulse({
          platformName: getPlatform(result.attempt.platformId)?.name ?? result.attempt.platformId,
          stats: result.attempt.stats,
          budget: result.budget,
          listings: result.listings,
        })
      : { configured: isPokeConfigured(), sent: false };
    return jsonNoStore({ ...result, poke });
  } catch (error) {
    if (error instanceof CrawlBudgetError) {
      return jsonNoStore(
        { error: error.message, budget: resolveBudget(readCatalog()) },
        429,
      );
    }
    if (error instanceof CrawlSourceError) {
      return jsonNoStore({ error: error.message }, 400);
    }
    return jsonNoStore(
      { error: "Crawl failed unexpectedly. No listings were invented." },
      500,
    );
  }
}
