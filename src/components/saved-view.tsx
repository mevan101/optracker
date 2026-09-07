"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { onSavedChanged, readSavedIds } from "@/lib/client/saved";
import { useLiveListings } from "@/lib/client/use-live-catalog";
import { JobCard } from "@/components/job-card";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/states";
import type { JobListing } from "@/lib/domain/types";

export function SavedView({ listings }: { listings: JobListing[] }) {
  const liveListings = useLiveListings(listings);
  const [ids, setIds] = useState<string[] | null>(null);

  useEffect(() => {
    const sync = () => setIds(readSavedIds());
    sync();
    return onSavedChanged(sync);
  }, []);

  const saved = useMemo(() => {
    if (!ids) {
      return [];
    }
    const set = new Set(ids);
    return liveListings.filter((listing) => set.has(listing.id));
  }, [ids, liveListings]);

  return (
    <div>
      <PageHeader title="Saved" meta={ids ? saved.length : undefined} />

      {ids === null ? (
        <div className="hairline-x min-h-[88px]" />
      ) : saved.length === 0 ? (
        <EmptyState
          title={ids.length ? "Those listings are gone" : "No saved roles"}
          body={
            ids.length
              ? "A bookmark stays only while the listing still passes integrity."
              : "Save a live role from the list."
          }
          action={
            <Link href="/" className="ghost pressable text-ivory">
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
