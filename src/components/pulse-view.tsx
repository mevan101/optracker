"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  fetchPlatforms,
  formatIntegrity,
  pulsePlatform,
  type PlatformRow,
} from "@/lib/client/api";
import { emitCatalogChanged } from "@/lib/client/catalog-sync";
import { PageHeader } from "@/components/page-header";
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
  const [acceptedNow, setAcceptedNow] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setPlatforms(initialPlatforms);
    setBudget(initialBudget);
  }, [initialPlatforms, initialBudget]);

  async function refresh() {
    setError(null);
    try {
      const payload = await fetchPlatforms();
      setPlatforms(payload.platforms);
      setBudget(payload.budget);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Pulse status is unavailable.");
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
      if (result.listings) {
        setPlatforms((current) =>
          current.map((platform) => ({
            ...platform,
            liveCount: result.listings!.filter((listing) => listing.platformId === platform.id)
              .length,
          })),
        );
      }
      setLastStats(result.attempt?.stats ?? null);
      setAcceptedNow(result.attempt?.stats.accepted ?? 0);
      if (result.attempt?.ok) {
        setMessage(
          `${result.attempt.stats.accepted} kept. ${formatIntegrity(result.attempt.stats)}.`,
        );
      } else {
        setMessage(result.attempt?.error ?? "That source did not return a usable feed.");
      }
      emitCatalogChanged();
      await refresh();
      router.refresh();
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Pulse was refused.");
    } finally {
      setBusyId(null);
    }
  }

  const crawlable = platforms.filter((platform) => platform.crawlable);
  const remainingRatio = budget.remaining / budget.limit;

  return (
    <div>
      <PageHeader title="Pulse" />

      {error ? <ErrorState body={error} onRetry={() => void refresh()} /> : null}

      <section className="mb-10">
        <p className="text-[13px] text-ash">Remaining today</p>
        <div className="mt-3 flex items-baseline gap-2">
          <p className="font-display text-[80px] font-normal leading-none tracking-[-0.04em] text-ivory">
            {budget.remaining}
          </p>
          <p className="text-[15px] tabular-nums text-ash">/ {budget.limit}</p>
        </div>
        <div className="mt-6 h-px overflow-hidden bg-white/[0.08]">
          <div
            className="meter h-full bg-ivory"
            style={{ transform: `scaleX(${remainingRatio})` }}
          />
        </div>
        <p className="mt-3 text-[12px] tabular-nums text-ash">{budget.date} UTC</p>
      </section>

      {message ? <p className="mb-6 text-[13px] leading-6 text-mist">{message}</p> : null}

      {lastStats ? (
        <p className="mb-4 text-[13px] leading-6 text-ash">
          {lastStats.accepted} kept · {lastStats.expired} expired ·{" "}
          {lastStats.broken + lastStats.invalid} broken · {lastStats.mock + lastStats.placeholder}{" "}
          mock
        </p>
      ) : null}

      {acceptedNow > 0 ? (
        <p className="mb-8">
          <Link href="/" className="pressable text-[14px] text-ivory">
            View live roles
          </Link>
        </p>
      ) : null}

      {crawlable.length === 0 ? (
        <EmptyState title="No sources" body="No public API adapters are registered." />
      ) : (
        <div>
          {crawlable.map((platform) => (
            <div
              key={platform.id}
              className="hairline-x flex items-center justify-between gap-4 py-[18px]"
            >
              <div className="min-w-0">
                <h2 className="text-[16.5px] font-medium tracking-[-0.025em] text-ivory">
                  {platform.name}
                </h2>
                <p className="mt-1 text-[13px] tabular-nums text-ash">
                  {platform.liveCount} live
                </p>
              </div>
              <button
                type="button"
                disabled={busyId !== null || budget.remaining < 1}
                onClick={() => void runPulse(platform.id)}
                aria-label={`Pulse ${platform.name}`}
                className="ghost pressable text-ivory"
              >
                {busyId === platform.id ? "Working…" : "Pulse"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
