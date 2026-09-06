"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconArrowLeft, IconBookmark } from "@/components/icons";
import { formatRelative } from "@/lib/domain/text";
import { readSavedIds, toggleSaved } from "@/lib/client/saved";
import type { JobListing } from "@/lib/domain/types";

export function JobDetail({ listing }: { listing: JobListing }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readSavedIds().includes(listing.id));
  }, [listing.id]);

  return (
    <div>
      <div className="mb-10 flex items-center justify-between">
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

      <p className="text-[13px] text-ash">{listing.company}</p>
      <h1 className="mt-2 text-[32px] font-medium leading-[1.05] tracking-[-0.045em] text-ivory">
        {listing.title}
      </h1>
      <p className="mt-4 text-[14px] leading-6 text-ash">
        {listing.location}
        <span> · </span>
        <span className="capitalize">{listing.workMode}</span>
        {listing.salary ? (
          <>
            <span> · </span>
            {listing.salary}
          </>
        ) : null}
        <span> · </span>
        {listing.platformName}
        <span> · </span>
        {formatRelative(listing.postedAt)}
      </p>

      <p className="mt-10 text-[16px] leading-7 tracking-[-0.018em] text-ivory/88">
        {listing.excerpt || "The source did not provide a usable excerpt."}
      </p>

      <a
        href={listing.url}
        target="_blank"
        rel="noreferrer"
        className="pressable hairline-t mt-12 block pt-4 text-[15px] font-medium tracking-[-0.02em] text-ivory"
      >
        Open on {listing.platformName}
      </a>
      <p className="mt-3 text-[12px] leading-5 text-ash">
        Apply on the original board. OpTracker does not invent copy.
      </p>
    </div>
  );
}
