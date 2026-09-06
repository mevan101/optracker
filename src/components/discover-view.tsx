"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { filterListings } from "@/lib/client/filter-listings";
import type { JobsResponse } from "@/lib/client/api";
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

  return (
    <div>
      <PageHeader
        title="Roles"
        meta={
          <>
            {listings.length}
            {initial.hidden ? ` · ${initial.hidden} out` : ""}
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
              : "Run a pulse to load jobs from a public board."
          }
          action={
            <Link href="/pulse" className="ghost pressable text-ivory">
              Go to Pulse
            </Link>
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
