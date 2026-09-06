import { EmptyState } from "@/components/states";
import type { PlatformRow } from "@/lib/client/api";

export function PlatformsView({ platforms }: { platforms: PlatformRow[] }) {
  return (
    <div>
      <header className="mb-8">
        <h1 className="text-[28px] font-medium leading-none tracking-[-0.04em] text-ivory">
          Boards
        </h1>
      </header>

      {platforms.length === 0 ? (
        <EmptyState title="No boards." body="The curated catalog is empty." />
      ) : (
        <div className="card-list">
          {platforms.map((platform) => (
            <a
              key={platform.id}
              href={platform.homeUrl}
              target="_blank"
              rel="noreferrer"
              className="row hairline-x flex items-baseline justify-between gap-6 py-4"
            >
              <div className="min-w-0">
                <h2 className="text-[16px] font-medium tracking-[-0.03em] text-ivory">
                  {platform.name}
                </h2>
                <p className="mt-1 text-[13px] text-ash">
                  {platform.crawlable ? "Public API" : "Directory"}
                </p>
              </div>
              <p className="shrink-0 text-[13px] text-ash">{platform.liveCount}</p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
