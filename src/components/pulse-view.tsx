"use client";

import { useCallback, useEffect, useState } from "react";
import {
  fetchPlatforms,
  formatIntegrity,
  pulsePlatform,
  type PlatformRow,
} from "@/lib/client/api";
import { EmptyState, ErrorState } from "@/components/states";
import type { CrawlBudget, IntegrityStats } from "@/lib/domain/types";

export function PulseView({
  initialPlatforms,
  initialBudget,
}: {
  initialPlatforms: PlatformRow[];
  initialBudget: CrawlBudget;
}) {
  const [platforms, setPlatforms] = useState<PlatformRow[]>(initialPlatforms);
  const [budget, setBudget] = useState<CrawlBudget | null>(initialBudget);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastStats, setLastStats] = useState<IntegrityStats | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchPlatforms()
      .then((payload) => {
        setPlatforms(payload.platforms);
        setBudget(payload.budget);
      })
      .catch((err: unknown) =>
        setError(err instanceof Error ? err.message : "Pulse status unavailable."),
      )
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function runPulse(platformId: string) {
    setBusyId(platformId);
    setMessage(null);
    try {
      const result = await pulsePlatform(platformId);
      setBudget(result.budget ?? null);
      setLastStats(result.attempt?.stats ?? null);
      if (result.attempt?.ok) {
        setMessage(
          `${result.attempt.stats.accepted} live roles kept from this pulse. ${formatIntegrity(result.attempt.stats)}.`,
        );
      } else {
        setMessage(result.attempt?.error ?? "The source did not return a usable feed.");
      }
      load();
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Pulse refused.");
    } finally {
      setBusyId(null);
    }
  }

  const crawlable = platforms.filter((platform) => platform.crawlable);

  return (
    <div>
      <header className="mb-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-mist lg:hidden">
          Integrity
        </p>
        <h1 className="mt-2 text-[32px] font-semibold leading-none text-ivory lg:mt-0">
          Pulse
        </h1>
        <p className="mt-2 text-[14px] text-mist">
          One source per pulse. Five pulses per UTC day. Filtered listings are
          discarded, never shown.
        </p>
      </header>

      {loading ? (
        <div className="glass mb-5 h-36 rounded-[28px]" />
      ) : null}
      {error ? <ErrorState body={error} onRetry={load} /> : null}

      {budget ? (
        <section className="glass mb-5 rounded-[28px] px-6 py-7">
          <p className="text-[11px] uppercase tracking-[0.18em] text-ash">
            Remaining today
          </p>
          <div className="mt-3 flex items-end justify-between">
            <p className="text-[64px] font-semibold leading-none text-ivory">
              {budget.remaining}
            </p>
            <p className="mb-2 text-[13px] text-mist">of {budget.limit}</p>
          </div>
          <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/[0.04]">
            <div
              className="h-full bg-ivory/80"
              style={{ width: `${(budget.remaining / budget.limit) * 100}%` }}
            />
          </div>
          <p className="mt-4 text-[12px] text-ash">UTC day {budget.date}</p>
        </section>
      ) : null}

      {message ? (
        <p className="mb-5 text-[13px] leading-6 text-mist">{message}</p>
      ) : null}

      {lastStats ? (
        <div className="mb-5 grid grid-cols-2 gap-2 text-[12px] text-mist">
          <Stat label="Accepted" value={lastStats.accepted} />
          <Stat label="Expired" value={lastStats.expired} />
          <Stat label="Broken" value={lastStats.broken + lastStats.invalid} />
          <Stat label="Mock / placeholder" value={lastStats.mock + lastStats.placeholder} />
        </div>
      ) : null}

      {!loading && crawlable.length === 0 ? (
        <EmptyState
          title="No pulse sources"
          body="No public API adapters are registered."
        />
      ) : (
        <div className="space-y-3">
          {crawlable.map((platform) => (
            <div key={platform.id} className="glass rounded-[24px] p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-[17px] font-semibold text-ivory">
                    {platform.name}
                  </h2>
                  <p className="mt-1 text-[13px] text-mist">{platform.attribution}</p>
                </div>
                <button
                  type="button"
                  disabled={busyId !== null || (budget?.remaining ?? 0) < 1}
                  onClick={() => runPulse(platform.id)}
                  className="rounded-full bg-ivory px-4 py-2 text-[13px] font-medium text-obsidian disabled:opacity-40"
                >
                  {busyId === platform.id ? "Pulsing…" : "Pulse"}
                </button>
              </div>
              <p className="mt-4 text-[12px] text-ash">
                {platform.liveCount} currently shown from this board
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass rounded-2xl px-3 py-3">
      <p className="text-ash">{label}</p>
      <p className="mt-1 text-[18px] text-ivory">{value}</p>
    </div>
  );
}
