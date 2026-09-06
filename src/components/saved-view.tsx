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
      <header className="mb-8 flex items-end justify-between">
        <h1 className="text-[28px] font-medium leading-none tracking-[-0.04em] text-ivory">
          Saved
        </h1>
        {ids ? <p className="text-[13px] text-ash">{saved.length}</p> : null}
      </header>

      {ids === null ? (
        <div className="hairline-x min-h-[76px]" />
      ) : saved.length === 0 ? (
        <EmptyState
          title={ids.length ? "Those roles are gone." : "Nothing saved."}
          body={
            ids.length
              ? "Bookmarks only stay if the listing still passes integrity."
              : "Save a live role from the board."
          }
          action={
            <Link href="/" className="pressable text-[14px] text-ivory">
              Back to Roles
            </Link>
          }
        />
      ) : (
        <div className="card-list">
          {saved.map((listing) => (
            <JobCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
