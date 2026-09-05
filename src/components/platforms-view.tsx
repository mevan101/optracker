import { IconArrowUpRight } from "@/components/icons";
import { EmptyState } from "@/components/states";
import type { PlatformRow } from "@/lib/client/api";

export function PlatformsView({ platforms }: { platforms: PlatformRow[] }) {
  return (
    <div>
      <header className="mb-6 min-h-[92px]">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-mist lg:hidden">
          Platforms
        </p>
        <h1 className="mt-2 text-[32px] font-semibold leading-none text-ivory lg:mt-0">
          Boards
        </h1>
        <p className="mt-2 text-[14px] text-mist">
          Real job platforms only. API boards can be pulsed. Directory boards open
          at the source.
        </p>
      </header>

      {platforms.length === 0 ? (
        <EmptyState title="No platforms" body="The curated catalog is empty." />
      ) : (
        <div className="card-list grid gap-3 lg:grid-cols-2">
          {platforms.map((platform) => (
            <a
              key={platform.id}
              href={platform.homeUrl}
              target="_blank"
              rel="noreferrer"
              className="panel lift rounded-[24px] p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-ash">
                    {platform.crawlable ? "Public API" : "Directory"}
                  </p>
                  <h2 className="mt-2 text-[18px] font-semibold text-ivory">
                    {platform.name}
                  </h2>
                </div>
                <span className="text-ash">
                  <IconArrowUpRight />
                </span>
              </div>
              <p className="mt-3 min-h-10 text-[13px] leading-5 text-mist">
                {platform.description}
              </p>
              <div className="mt-4 text-[12px] text-ash">
                {platform.liveCount} live roles in OpTracker
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
