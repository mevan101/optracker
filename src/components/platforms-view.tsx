"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { fetchPlatforms, type PlatformRow } from "@/lib/client/api";
import { EmptyState, ErrorState, SkeletonList } from "@/components/states";

export function PlatformsView() {
  const [platforms, setPlatforms] = useState<PlatformRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  function load() {
    setLoading(true);
    setError(null);
    fetchPlatforms()
      .then((payload) => setPlatforms(payload.platforms))
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Platforms unavailable."),
      )
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <header className="mb-6">
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

      {loading ? <SkeletonList count={5} /> : null}
      {!loading && error ? <ErrorState body={error} onRetry={load} /> : null}
      {!loading && !error && platforms.length === 0 ? (
        <EmptyState title="No platforms" body="The curated catalog is empty." />
      ) : null}
      {!loading && !error ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {platforms.map((platform) => (
            <a
              key={platform.id}
              href={platform.homeUrl}
              target="_blank"
              rel="noreferrer"
              className="glass rounded-[24px] p-5 transition hover:bg-white/[0.05]"
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
                <ArrowUpRight size={16} className="text-ash" />
              </div>
              <p className="mt-3 text-[13px] leading-5 text-mist">
                {platform.description}
              </p>
              <div className="mt-4 text-[12px] text-ash">
                {platform.liveCount} live roles in OpTracker
              </div>
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}
