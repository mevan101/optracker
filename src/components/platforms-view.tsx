import { EmptyState } from "@/components/states";
import { PageHeader } from "@/components/page-header";
import type { PlatformRow } from "@/lib/client/api";

export function PlatformsView({ platforms }: { platforms: PlatformRow[] }) {
  return (
    <div>
      <PageHeader title="Boards" meta={platforms.length} />

      {platforms.length === 0 ? (
        <EmptyState title="No boards" body="The curated catalog is empty." />
      ) : (
        <div className="card-list">
          {platforms.map((platform) => (
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
                  {platform.crawlable ? "Public API" : "Directory only"}
                </p>
              </div>
              <p className="shrink-0 pt-0.5 text-[13px] tabular-nums text-mist">
                {platform.liveCount}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
