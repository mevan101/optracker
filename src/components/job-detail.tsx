"use client";

import { useState } from "react";
import Link from "next/link";
import { IconArrowLeft, IconBookmark } from "@/components/icons";
import { formatRelative, polishExcerpt, workModeLabel } from "@/lib/domain/text";
import { fetchPokeStatus, sendPokeIntent } from "@/lib/client/api";
import { toggleSaved, useIsSaved } from "@/lib/client/saved";
import type { JobListing } from "@/lib/domain/types";

function Fact({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) {
    return null;
  }
  return (
    <div className="hairline-x grid grid-cols-[6.25rem_1fr] gap-4 py-3">
      <dt className="text-[13px] text-ash">{label}</dt>
      <dd className="text-[13px] text-ivory">{value}</dd>
    </div>
  );
}

export function JobDetail({ listing }: { listing: JobListing }) {
  const saved = useIsSaved(listing.id);
  const [pokeBusy, setPokeBusy] = useState(false);
  const [pokeNote, setPokeNote] = useState<string | null>(null);

  async function askPoke() {
    setPokeBusy(true);
    setPokeNote(null);
    try {
      const status = await fetchPokeStatus();
      if (!status.configured) {
        setPokeNote("Set POKE_API_KEY, then retry from Pulse.");
        return;
      }
      const result = await sendPokeIntent("role", listing.id);
      if (result.sent) {
        setPokeNote("Poke has this role.");
      } else {
        setPokeNote(result.error ?? "Poke did not accept that brief.");
      }
    } catch (err: unknown) {
      setPokeNote(err instanceof Error ? err.message : "Poke could not be reached.");
    } finally {
      setPokeBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-9 flex items-center justify-between">
        <Link href="/" className="pressable flex items-center gap-1.5 text-[14px] text-ash">
          <IconArrowLeft />
          Roles
        </Link>
        <button
          type="button"
          onClick={() => toggleSaved(listing.id)}
          aria-pressed={saved}
          aria-label={saved ? "Remove saved role" : "Save role"}
          className="pressable text-[14px] text-ivory"
        >
          <span className="inline-flex items-center gap-1.5">
            <IconBookmark size={15} filled={saved} />
            {saved ? "Saved" : "Save"}
          </span>
        </button>
      </div>

      <p className="text-[14px] text-mist">{listing.company}</p>
      <h1 className="mt-2 font-display text-[34px] font-normal leading-[1.08] tracking-[-0.03em] text-ivory">
        {listing.title}
      </h1>

      <dl className="mt-8">
        <Fact label="Location" value={listing.location} />
        <Fact label="Mode" value={workModeLabel(listing.workMode)} />
        <Fact label="Salary" value={listing.salary} />
        <Fact label="Board" value={listing.platformName} />
        <Fact label="Posted" value={formatRelative(listing.postedAt)} />
      </dl>

      <p className="mt-8 text-[16px] leading-7 tracking-[-0.012em] text-ivory/90">
        {polishExcerpt(listing.excerpt) ||
          "This listing did not include a usable excerpt."}
      </p>

      <a
        href={listing.url}
        target="_blank"
        rel="noreferrer"
        className="solid pressable mt-10"
      >
        Open on {listing.platformName}
      </a>
      <p className="mt-3 text-[12px] leading-5 text-ash">Opens the original listing.</p>

      <button
        type="button"
        onClick={() => void askPoke()}
        disabled={pokeBusy}
        className="pressable mt-8 text-[14px] text-ivory disabled:text-ash"
      >
        {pokeBusy ? "Sending…" : pokeNote === "Poke has this role." ? "Sent to Poke" : "Ask Poke"}
      </button>
      <p className="mt-2 text-[12px] leading-5 text-ash">
        {pokeNote ?? "Briefs poke.com so it can research and remind you."}
      </p>
    </div>
  );
}
