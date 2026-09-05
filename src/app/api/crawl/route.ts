import { NextResponse } from "next/server";
import { z } from "zod";
import {
  CrawlBudgetError,
  CrawlSourceError,
  crawlPlatform,
} from "@/lib/crawl/orchestrator";
import { resolveBudget } from "@/lib/crawl/budget";
import { getCrawlablePlatforms } from "@/lib/domain/platforms";
import { readCatalog } from "@/lib/store/persistence";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({
  platformId: z.string().min(2).optional(),
});

export function GET() {
  const snapshot = readCatalog();
  return NextResponse.json({
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
      return NextResponse.json({ error: "Invalid crawl request." }, { status: 400 });
    }
    platformId = parsed.data.platformId;
  } catch {
    return NextResponse.json({ error: "Invalid crawl request." }, { status: 400 });
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
      return NextResponse.json(
        { error: "Daily crawl limit reached (5 per UTC day).", budget },
        { status: 429 },
      );
    }
    platformId = next.id;
  }

  try {
    const result = await crawlPlatform({ platformId });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof CrawlBudgetError) {
      return NextResponse.json(
        { error: error.message, budget: resolveBudget(readCatalog()) },
        { status: 429 },
      );
    }
    if (error instanceof CrawlSourceError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Crawl failed unexpectedly. No listings were invented." },
      { status: 500 },
    );
  }
}
