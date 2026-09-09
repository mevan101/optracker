import { JOB_PLATFORMS } from "@/lib/domain/platforms";
import type { CrawlAttempt } from "@/lib/domain/types";
import type { PlatformRow } from "@/lib/client/api";

export function toPlatformRows(
  listings: Array<{ platformId: string }>,
  lastAttempts: CrawlAttempt[],
): PlatformRow[] {
  const counts = new Map<string, number>();
  for (const listing of listings) {
    counts.set(listing.platformId, (counts.get(listing.platformId) ?? 0) + 1);
  }

  return JOB_PLATFORMS.map((platform) => {
    const attempt = lastAttempts.find((item) => item.platformId === platform.id) ?? null;
    return {
      ...platform,
      liveCount: counts.get(platform.id) ?? 0,
      lastAttempt: attempt
        ? {
            at: attempt.finishedAt,
            ok: attempt.ok,
            accepted: attempt.stats.accepted,
            error: attempt.error,
          }
        : null,
    };
  });
}
