"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { filterListings } from "@/lib/client/filter-listings";
import type { JobsResponse } from "@/lib/client/api";
import { IconClose, IconSearch } from "@/components/icons";
import { JobCard, Pill } from "@/components/job-card";
import { EmptyState } from "@/components/states";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "remote", label: "Remote" },
  { id: "hybrid", label: "Hybrid" },
  { id: "onsite", label: "On-site" },
] as const;

export function DiscoverView({ initial }: { initial: JobsResponse }) {
  const [query, setQuery] = useState("");
  const [workMode, setWorkMode] = useState("all");
  const [platformId, setPlatformId] = useState("all");

  const platforms = useMemo(() => {
    const seen = new Map<string, string>();
    for (const listing of initial.listings) {
      if (!seen.has(listing.platformId)) {
        seen.set(listing.platformId, listing.platformName);
      }
    }
    return [...seen.entries()].map(([id, name]) => ({ id, name }));
  }, [initial.listings]);

  const listings = useMemo(
    () => filterListings(initial.listings, query, workMode, platformId),
    [initial.listings, query, workMode, platformId],
  );

  const filtered = Boolean(query.trim() || workMode !== "all" || platformId !== "all");
  const emptyCopy = filtered
    ? "Nothing in the live catalog matches that filter."
    : "The board is empty until a pulse fetches real listings. Nothing is fabricated.";

  return (
    <div>
      <header className="mb-6 min-h-[92px]">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-mist lg:hidden">
          OpTracker
        </p>
        <h1 className="mt-2 text-[32px] font-semibold leading-none text-ivory lg:mt-0">
          Discover
        </h1>
        <p className="mt-2 text-[14px] text-mist">
          Verified roles from public job-platform APIs.
        </p>
      </header>

      <label className="panel mb-4 flex min-h-12 items-center gap-3 rounded-full px-4">
        <span className="text-ash">
          <IconSearch />
        </span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, company, city"
          aria-label="Search roles"
          className="w-full bg-transparent text-[15px] text-ivory outline-none placeholder:text-ash"
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

      <div className="no-scrollbar mb-3 flex min-h-9 gap-2 overflow-x-auto">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setWorkMode(filter.id)}
            aria-pressed={workMode === filter.id}
            className={`pressable rounded-full px-3.5 py-1.5 text-[13px] ${
              workMode === filter.id
                ? "bg-ivory text-obsidian"
                : "panel text-mist"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {platforms.length > 1 ? (
        <div className="no-scrollbar mb-5 flex min-h-9 gap-2 overflow-x-auto">
          <button
            type="button"
            onClick={() => setPlatformId("all")}
            aria-pressed={platformId === "all"}
            className={`pressable rounded-full px-3.5 py-1.5 text-[13px] ${
              platformId === "all" ? "bg-ivory text-obsidian" : "panel text-mist"
            }`}
          >
            Every board
          </button>
          {platforms.map((platform) => (
            <button
              key={platform.id}
              type="button"
              onClick={() => setPlatformId(platform.id)}
              aria-pressed={platformId === platform.id}
              className={`pressable rounded-full px-3.5 py-1.5 text-[13px] ${
                platformId === platform.id
                  ? "bg-ivory text-obsidian"
                  : "panel text-mist"
              }`}
            >
              {platform.name}
            </button>
          ))}
        </div>
      ) : (
        <div className="mb-5" />
      )}

      <div className="mb-4 flex min-h-4 items-center justify-between text-[12px] text-ash">
        <span>
          {listings.length} live
          {initial.hidden ? ` · ${initial.hidden} hidden` : ""}
        </span>
        <span>{initial.budget.remaining} pulses left today</span>
      </div>

      {listings.length === 0 ? (
        <EmptyState
          title="Quiet board"
          body={emptyCopy}
          action={
            <Link
              href="/pulse"
              className="pressable glass-strong inline-flex rounded-full px-5 py-2 text-[13px] text-ivory"
            >
              Open Pulse
            </Link>
          }
        />
      ) : (
        <div className="card-list space-y-3">
          {listings.map((listing) => (
            <JobCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      <div className="mt-6 flex min-h-6 flex-wrap gap-1.5">
        <Pill>No mock data</Pill>
        <Pill>No placeholders</Pill>
        <Pill>Expired listings removed</Pill>
      </div>
    </div>
  );
}
