"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { filterListings } from "@/lib/client/filter-listings";
import { jobsFromCrawl, pulsePlatform, type JobsResponse } from "@/lib/client/api";
import { publishJobsSnapshot } from "@/lib/client/catalog-sync";
import { useLiveJobs } from "@/lib/client/use-live-catalog";
import { formatRelative } from "@/lib/domain/text";
import { IconClose, IconSearch } from "@/components/icons";
import { JobCard } from "@/components/job-card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/states";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "remote", label: "Remote" },
  { id: "hybrid", label: "Hybrid" },
  { id: "onsite", label: "On-site" },
] as const;

export function DiscoverView({
  initial,
  focusBoard,
}: {
  initial: JobsResponse;
  focusBoard?: string;
}) {
  const catalog = useLiveJobs(initial);
  const [query, setQuery] = useState("");
  const [workMode, setWorkMode] = useState("all");
  const [platformId, setPlatformId] = useState(focusBoard || "all");
  const [loadingPulse, setLoadingPulse] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (focusBoard) {
      setPlatformId(focusBoard);
    }
  }, [focusBoard]);

  const platforms = useMemo(() => {
    const seen = new Map<string, string>();
    for (const listing of catalog.listings) {
      if (!seen.has(listing.platformId)) {
        seen.set(listing.platformId, listing.platformName);
      }
    }
    return [...seen.entries()].map(([id, name]) => ({ id, name }));
  }, [catalog.listings]);

  const listings = useMemo(
    () => filterListings(catalog.listings, query, workMode, platformId),
    [catalog.listings, query, workMode, platformId],
  );

  const filtered = Boolean(query.trim() || workMode !== "all" || platformId !== "all");

  async function loadJobs() {
    setLoadingPulse(true);
    setLoadError(null);
    try {
      const result = await pulsePlatform();
      const snapshot = jobsFromCrawl(result);
      if (snapshot) {
        publishJobsSnapshot(snapshot);
      }
      if (result.attempt?.ok && result.attempt.platformId) {
        setPlatformId(result.attempt.platformId);
      }
      if (result.attempt && !result.attempt.ok) {
        setLoadError(result.attempt.error ?? "That JSON feed did not return a usable payload.");
      }
    } catch (err: unknown) {
      setLoadError(err instanceof Error ? err.message : "Pulse was refused.");
    } finally {
      setLoadingPulse(false);
    }
  }

  return (
    <div>
      <PageHeader
        title="Roles"
        meta={
          <>
            {listings.length}
            {catalog.hidden ? ` · ${catalog.hidden} out` : ""}
            {catalog.updatedAt ? ` · ${formatRelative(catalog.updatedAt)}` : ""}
          </>
        }
      />

      <label className="field mb-4">
        <span className="text-ash">
          <IconSearch />
        </span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title or company"
          aria-label="Search roles"
          className="w-full bg-transparent text-[16px] font-normal tracking-[-0.015em] text-ivory outline-none placeholder:text-ash"
        />
        {query ? (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="pressable text-ash"
          >
            <IconClose />
          </button>
        ) : null}
      </label>

      <div className="segment mb-4" role="tablist" aria-label="Work mode">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            role="tab"
            aria-selected={workMode === filter.id}
            onClick={() => setWorkMode(filter.id)}
            className="text-[13px] tracking-[-0.015em]"
          >
            {filter.label}
          </button>
        ))}
      </div>

      {platforms.length > 1 ? (
        <div className="no-scrollbar mb-5 flex gap-5 overflow-x-auto text-[13px]">
          <button
            type="button"
            onClick={() => setPlatformId("all")}
            aria-pressed={platformId === "all"}
            className={platformId === "all" ? "text-ivory" : "text-ash"}
          >
            All boards
          </button>
          {platforms.map((platform) => (
            <button
              key={platform.id}
              type="button"
              onClick={() => setPlatformId(platform.id)}
              aria-pressed={platformId === platform.id}
              className={platformId === platform.id ? "text-ivory" : "text-ash"}
            >
              {platform.name}
            </button>
          ))}
        </div>
      ) : (
        <div className="mb-2" />
      )}

      {listings.length === 0 ? (
        <EmptyState
          title={filtered ? "No matches" : "No roles yet"}
          body={
            filtered
              ? "Clear search or try another filter."
              : loadError ??
                (catalog.budget.remaining < 1
                  ? "Today's five pulses are spent. New roles land after the next UTC day, or from Pulse if a board is already live."
                  : "Load jobs from a public JSON board. This uses one of today's five pulses.")
          }
          action={
            filtered || catalog.budget.remaining < 1 ? (
              <Link href="/pulse" className="ghost pressable text-ivory">
                Go to Pulse
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => void loadJobs()}
                disabled={loadingPulse}
                className="ghost pressable text-ivory disabled:text-ash"
              >
                {loadingPulse ? "Loading…" : "Load jobs"}
              </button>
            )
          }
        />
      ) : (
        <div className="card-list">
          {listings.map((listing) => (
            <JobCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
