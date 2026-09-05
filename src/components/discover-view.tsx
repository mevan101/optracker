"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { fetchJobs, type JobsResponse } from "@/lib/client/api";
import { JobCard, Pill } from "@/components/job-card";
import { EmptyState, ErrorState, SkeletonList } from "@/components/states";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "remote", label: "Remote" },
  { id: "hybrid", label: "Hybrid" },
  { id: "onsite", label: "On-site" },
] as const;

export function DiscoverView({ initial }: { initial: JobsResponse }) {
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [workMode, setWorkMode] = useState("all");
  const [data, setData] = useState<JobsResponse>(initial);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(query.trim()), 180);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    const isDefault = !debounced && workMode === "all";
    if (!isDefault) {
      setLoading(true);
    }
    setError(null);
    fetchJobs({
      q: debounced || undefined,
      workMode: workMode === "all" ? undefined : workMode,
    })
      .then((payload) => {
        if (!cancelled) {
          setData(payload);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Catalog unavailable.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [debounced, workMode]);

  const remaining = data.budget.remaining;
  const emptyCopy = useMemo(() => {
    if (debounced || workMode !== "all") {
      return "Nothing in the live catalog matches that filter.";
    }
    return "The board is empty until a pulse fetches real listings. Nothing is fabricated.";
  }, [debounced, workMode]);

  return (
    <div>
      <header className="mb-6">
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

      <label className="glass mb-4 flex items-center gap-3 rounded-full px-4 py-3">
        <Search size={16} className="text-ash" strokeWidth={1.5} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search title, company, city"
          className="w-full bg-transparent text-[15px] text-ivory outline-none placeholder:text-ash"
        />
      </label>

      <div className="no-scrollbar mb-5 flex gap-2 overflow-x-auto">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setWorkMode(filter.id)}
            className={`rounded-full px-3.5 py-1.5 text-[13px] ${
              workMode === filter.id
                ? "bg-ivory text-obsidian"
                : "glass text-mist"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <div className="mb-4 flex items-center justify-between text-[12px] text-ash">
        <span>
          {data.total} live
          {data.hidden ? ` · ${data.hidden} hidden` : ""}
        </span>
        <span>{remaining} pulses left today</span>
      </div>

      {loading ? <SkeletonList /> : null}
      {!loading && error ? (
        <ErrorState body={error} onRetry={() => setDebounced((value) => value)} />
      ) : null}
      {!loading && !error && data.listings.length === 0 ? (
        <EmptyState
          title="Quiet board"
          body={emptyCopy}
          action={
            <Link
              href="/pulse"
              className="glass-strong inline-flex rounded-full px-5 py-2 text-[13px] text-ivory"
            >
              Open Pulse
            </Link>
          }
        />
      ) : null}
      {!loading && !error && data.listings.length > 0 ? (
        <div className="space-y-3">
          {data.listings.map((listing) => (
            <JobCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : null}

      <div className="mt-6 flex flex-wrap gap-1.5">
        <Pill>No mock data</Pill>
        <Pill>No placeholders</Pill>
        <Pill>Expired listings removed</Pill>
      </div>
    </div>
  );
}
