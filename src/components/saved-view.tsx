"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { readSavedIds } from "@/lib/client/saved";
import { JobCard } from "@/components/job-card";
import { EmptyState } from "@/components/states";
import type { JobListing } from "@/lib/domain/types";

export function SavedView({ listings }: { listings: JobListing[] }) {
  const [ids, setIds] = useState<string[] | null>(null);

  useEffect(() => {
    setIds(readSavedIds());
  }, []);

  const saved = useMemo(() => {
    if (!ids) {
      return [];
    }
    const set = new Set(ids);
    return listings.filter((listing) => set.has(listing.id));
  }, [ids, listings]);

  return (
    <div>
      <header className="mb-6 min-h-[110px]">
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

      {ids === null ? (
        <div className="panel min-h-[148px] rounded-[22px]" />
      ) : saved.length === 0 ? (
        <EmptyState
          title={ids.length ? "Saved roles are no longer live" : "Nothing saved"}
          body={
            ids.length
              ? "Those bookmarks pointed at listings that were filtered out or not yet pulsed."
              : "Save a live role from Discover. Empty is honest."
          }
          action={
            <Link
              href="/"
              className="pressable glass-strong inline-flex rounded-full px-5 py-2 text-[13px] text-ivory"
            >
              Back to Discover
            </Link>
          }
        />
      ) : (
        <div className="card-list space-y-3">
          {saved.map((listing) => (
            <JobCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
