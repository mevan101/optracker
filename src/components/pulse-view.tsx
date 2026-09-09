"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  fetchPlatforms,
  fetchPokeStatus,
  formatIntegrity,
  jobsFromCrawl,
  pulsePlatform,
  sendPokeIntent,
  type PlatformRow,
  type PokeStatusResponse,
} from "@/lib/client/api";
import { onCatalogChanged, publishJobsSnapshot } from "@/lib/client/catalog-sync";
import { formatRelative } from "@/lib/domain/text";
import { POKE_DOCS_URL, POKE_INTEGRATIONS_URL } from "@/lib/poke/links";
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
  const [lastPulseId, setLastPulseId] = useState<string | null>(null);
  const [acceptedNow, setAcceptedNow] = useState(0);
  const [poke, setPoke] = useState<PokeStatusResponse | null>(null);
  const [pokeBusy, setPokeBusy] = useState(false);
  const [pokeNote, setPokeNote] = useState<string | null>(null);
  const router = useRouter();

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

  async function refreshPoke() {
    try {
      const status = await fetchPokeStatus();
      setPoke(status);
    } catch {
      setPoke(null);
    }
  }

  useEffect(() => {
    void refreshPoke();
    return onCatalogChanged(() => {
      void refresh();
    });
  }, []);

  async function runPulse(platformId: string) {
    setBusyId(platformId);
    setMessage(null);
    try {
      const result = await pulsePlatform(platformId);
      if (result.budget) {
        setBudget(result.budget);
      }
      const snapshot = jobsFromCrawl(result);
      if (snapshot) {
        publishJobsSnapshot(snapshot);
      }
      const attempt = result.attempt;
      if (attempt) {
        setPlatforms((current) =>
          current.map((platform) => {
            if (platform.id !== attempt.platformId) {
              return platform;
            }
            return {
              ...platform,
              liveCount:
                result.listings?.filter((listing) => listing.platformId === platform.id).length ??
                attempt.stats.accepted,
              lastAttempt: {
                at: attempt.finishedAt,
                ok: attempt.ok,
                accepted: attempt.stats.accepted,
                error: attempt.error,
              },
            };
          }),
        );
      }
      setLastPulseId(attempt?.platformId ?? platformId);
      setLastStats(attempt?.stats ?? null);
      setAcceptedNow(attempt?.stats.accepted ?? 0);
      const name =
        platforms.find((platform) => platform.id === (attempt?.platformId ?? platformId))?.name ??
        "that source";
      if (attempt?.ok) {
        const pokeLine = result.poke?.sent
          ? " Poke was briefed."
          : result.poke?.configured
            ? result.poke.error
              ? ` Poke: ${result.poke.error}.`
              : ""
            : "";
        setMessage(
          `${attempt.stats.accepted} ${name} roles are on the board. ${formatIntegrity(attempt.stats)}.${pokeLine}`,
        );
      } else {
        setMessage(attempt?.error ?? "That JSON feed did not return a usable payload.");
      }
      await Promise.all([refresh(), refreshPoke()]);
      router.refresh();
    } catch (err: unknown) {
      setMessage(err instanceof Error ? err.message : "Pulse was refused.");
    } finally {
      setBusyId(null);
    }
  }

  async function pingPoke() {
    setPokeBusy(true);
    setPokeNote(null);
    try {
      const result = await sendPokeIntent("test");
      if (result.sent) {
        setPokeNote("Test brief delivered.");
      } else {
        setPokeNote(result.error ?? "Poke did not accept that ping.");
      }
      await refreshPoke();
    } catch (err: unknown) {
      setPokeNote(err instanceof Error ? err.message : "Poke could not be reached.");
    } finally {
      setPokeBusy(false);
    }
  }

  const crawlable = platforms.filter((platform) => platform.crawlable);
  const remainingRatio = budget.remaining / budget.limit;
  const latestPulse = [...crawlable]
    .filter(
      (platform) => platform.lastAttempt?.ok && (platform.lastAttempt.accepted ?? 0) > 0,
    )
    .sort(
      (a, b) => Date.parse(b.lastAttempt!.at) - Date.parse(a.lastAttempt!.at),
    )[0];
  const ctaId = lastPulseId ?? latestPulse?.id ?? null;
  const ctaName = platforms.find((platform) => platform.id === ctaId)?.name;
  const showBoardLink = Boolean(ctaId && (acceptedNow > 0 || latestPulse));

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
        <p className="mt-4 max-w-[34ch] text-[13px] leading-6 text-ash">
          Each pulse fetches a public JSON feed. LinkedIn, Indeed, and the other HTML boards stay
          as links — they are not scraped.
        </p>
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

      {showBoardLink && ctaId ? (
        <p className="mb-8">
          <Link href={`/?board=${encodeURIComponent(ctaId)}`} className="pressable text-[14px] text-ivory">
            {ctaName ? `See ${ctaName} on Roles` : "View live roles"}
          </Link>
        </p>
      ) : null}

      {crawlable.length === 0 ? (
        <EmptyState title="No sources" body="No public JSON adapters are registered." />
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
                <p className="mt-1 text-[13px] text-ash">
                  <span className="tabular-nums">{platform.liveCount} live</span>
                  <span className="text-ash/70"> · </span>
                  {platform.lastAttempt
                    ? platform.lastAttempt.ok
                      ? formatRelative(platform.lastAttempt.at)
                      : platform.lastAttempt.error ?? "Failed"
                    : "Not pulsed"}
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

      <section id="poke" className="mt-12">
        <h2 className="font-display text-[26px] font-normal tracking-[-0.025em] text-ivory">
          Poke
        </h2>
        <p className="mt-3 max-w-[34ch] text-[13px] leading-6 text-ash">
          {poke?.configured
            ? "Each successful pulse sends a brief to poke.com. Ask Poke from any role."
            : "Set POKE_API_KEY to brief poke.com after each pulse."}
        </p>
        <p className="mt-3 text-[13px] text-mist">
          {poke?.configured ? "Connected" : "Not connected"}
          {poke?.last ? ` · Last ${poke.last.kind} ${formatRelative(poke.last.at)}` : ""}
        </p>
        {pokeNote ? <p className="mt-3 text-[13px] leading-6 text-ash">{pokeNote}</p> : null}
        <div className="mt-6 flex flex-wrap items-center gap-5">
          <button
            type="button"
            disabled={pokeBusy || !poke?.configured}
            onClick={() => void pingPoke()}
            className="ghost pressable text-ivory disabled:text-ash"
          >
            {pokeBusy ? "Sending…" : "Send a test"}
          </button>
          <a
            href={poke?.configured ? POKE_INTEGRATIONS_URL : POKE_DOCS_URL}
            target="_blank"
            rel="noreferrer"
            className="pressable text-[14px] text-ash"
          >
            {poke?.configured ? "Add MCP in Poke" : "Kitchen API keys"}
          </a>
        </div>
      </section>
    </div>
  );
}
