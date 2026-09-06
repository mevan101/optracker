"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconArrowLeft, IconBookmark } from "@/components/icons";
import { formatRelative, workModeLabel } from "@/lib/domain/text";
import { readSavedIds, toggleSaved } from "@/lib/client/saved";
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
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readSavedIds().includes(listing.id));
  }, [listing.id]);

  return (
    <div>
      <div className="mb-9 flex items-center justify-between">
        <Link href="/" className="pressable flex items-center gap-1.5 text-[14px] text-ash">
          <IconArrowLeft />
          Roles
        </Link>
        <button
          type="button"
          onClick={() => setSaved(toggleSaved(listing.id).includes(listing.id))}
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
        {listing.excerpt || "This listing did not include a usable excerpt."}
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
    </div>
  );
}
