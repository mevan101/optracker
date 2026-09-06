"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  const [budget, setBudget] = useState<CrawlBudget>(initialBudget);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastStats, setLastStats] = useState<IntegrityStats | null>(null);
  const router = useRouter();

  async function refresh() {
    setError(null);
    try {
      const payload = await fetchPlatforms();
      setPlatforms(payload.platforms);
      setBudget(payload.budget);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Pulse status unavailable.");
    }
  }

  async function runPulse(platformId: string) {
    setBusyId(platformId);
    setMessage(null);
    try {
      const result = await pulsePlatform(platformId);
      if (result.budget) {
        setBudget(result.budget);
      }
      setLastStats(result.attempt?.stats ?? null);
      if (result.attempt?.ok) {
        setMessage(
          `${result.attempt.stats.accepted} kept. ${formatIntegrity(result.attempt.stats)}.`,
        );
      } else {
        setMessage(result.attempt?.error ?? "The source did not return a usable feed.");
      }
      await refresh();
      router.refresh();
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Pulse refused.");
    } finally {
      setBusyId(null);
    }
  }

  const crawlable = platforms.filter((platform) => platform.crawlable);
  const remainingRatio = budget.remaining / budget.limit;

  return (
    <div>
      <header className="mb-10">
        <h1 className="text-[28px] font-medium leading-none tracking-[-0.04em] text-ivory">
          Pulse
        </h1>
      </header>

      {error ? <ErrorState body={error} onRetry={() => void refresh()} /> : null}

      <section className="mb-10">
        <p className="text-[13px] text-ash">Remaining today</p>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="text-[72px] font-medium leading-none tracking-[-0.05em] text-ivory">
            {budget.remaining}
          </p>
          <p className="text-[15px] text-ash">/ {budget.limit}</p>
        </div>
        <div className="mt-6 h-px overflow-hidden bg-white/[0.06]">
          <div
            className="meter h-full bg-ivory"
            style={{ transform: `scaleX(${remainingRatio})` }}
          />
        </div>
        <p className="mt-3 text-[12px] text-ash">{budget.date} UTC</p>
      </section>

      {message ? <p className="mb-6 text-[13px] leading-6 text-ash">{message}</p> : null}

      {lastStats ? (
        <p className="mb-8 text-[13px] leading-6 text-ash">
          {lastStats.accepted} kept · {lastStats.expired} expired ·{" "}
          {lastStats.broken + lastStats.invalid} broken · {lastStats.mock + lastStats.placeholder}{" "}
          mock
        </p>
      ) : null}

      {crawlable.length === 0 ? (
        <EmptyState title="No sources." body="No public API adapters are registered." />
      ) : (
        <div>
          {crawlable.map((platform) => (
            <div
              key={platform.id}
              className="hairline-x flex items-center justify-between gap-4 py-4"
            >
              <div className="min-w-0">
                <h2 className="text-[16px] font-medium tracking-[-0.03em] text-ivory">
                  {platform.name}
                </h2>
                <p className="mt-1 text-[13px] text-ash">{platform.liveCount} live</p>
              </div>
              <button
                type="button"
                disabled={busyId !== null || budget.remaining < 1}
                onClick={() => void runPulse(platform.id)}
                aria-label={`Pulse ${platform.name}`}
                className="pressable text-[14px] text-ivory disabled:text-ash"
              >
                {busyId === platform.id ? "Working" : "Pulse"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
