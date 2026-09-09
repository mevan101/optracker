"use client";

import { EmptyState } from "@/components/states";
import { PageHeader } from "@/components/page-header";
import type { PlatformRow } from "@/lib/client/api";
import { useLivePlatforms } from "@/lib/client/use-live-catalog";
import { formatRelative } from "@/lib/domain/text";

export function PlatformsView({ platforms }: { platforms: PlatformRow[] }) {
  const live = useLivePlatforms(platforms);

  return (
    <div>
      <PageHeader title="Boards" meta={live.length} />

      {live.length === 0 ? (
        <EmptyState title="No boards" body="The curated catalog is empty." />
      ) : (
        <div className="card-list">
          {live.map((platform) => (
            <a
              key={platform.id}
              href={platform.homeUrl}
              target="_blank"
              rel="noreferrer"
              className="row hairline-x flex items-start justify-between gap-6 py-[18px]"
            >
              <div className="min-w-0">
                <h2 className="text-[16.5px] font-medium leading-[1.25] tracking-[-0.025em] text-ivory">
                  {platform.name}
                </h2>
                <p className="mt-1.5 text-[13px] text-ash">
                  {platform.crawlable
                    ? platform.lastAttempt
                      ? `JSON feed · ${formatRelative(platform.lastAttempt.at)}`
                      : "JSON feed · Not pulsed"
                    : "Directory only"}
                </p>
              </div>
              <p className="shrink-0 pt-0.5 text-[13px] tabular-nums text-mist">
                {platform.crawlable ? platform.liveCount : "Open"}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
