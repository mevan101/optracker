"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchJobs } from "@/lib/client/api";
import { readSavedIds } from "@/lib/client/saved";
import { JobCard } from "@/components/job-card";
import { EmptyState, ErrorState, SkeletonList } from "@/components/states";
import type { JobListing } from "@/lib/domain/types";

export function SavedView() {
  const [listings, setListings] = useState<JobListing[]>([]);
  const [savedCount, setSavedCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setLoading(true);
    setError(null);
    const ids = new Set(readSavedIds());
    setSavedCount(ids.size);
    fetchJobs()
      .then((payload) => {
        setListings(payload.listings.filter((listing) => ids.has(listing.id)));
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Saved roles unavailable."),
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
          Collection
        </p>
        <h1 className="mt-2 text-[32px] font-semibold leading-none text-ivory lg:mt-0">
          Saved
        </h1>
        <p className="mt-2 text-[14px] text-mist">
          Kept on this device. Roles disappear if they fail a later integrity pass.
        </p>
      </header>

      {loading ? <SkeletonList count={3} /> : null}
      {error ? <ErrorState body={error} onRetry={load} /> : null}
      {!loading && !error && listings.length === 0 ? (
        <EmptyState
          title={savedCount ? "Saved roles are no longer live" : "Nothing saved"}
          body={
            savedCount
              ? "Those bookmarks pointed at listings that were filtered out or not yet pulsed."
              : "Save a live role from Discover. Empty is honest."
          }
          action={
            <Link
              href="/"
              className="glass-strong inline-flex rounded-full px-5 py-2 text-[13px] text-ivory"
            >
              Back to Discover
            </Link>
          }
        />
      ) : null}
      {!loading && !error && listings.length > 0 ? (
        <div className="space-y-3">
          {listings.map((listing) => (
            <JobCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
