"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, Bookmark } from "lucide-react";
import { companyInitials, formatRelative } from "@/lib/domain/text";
import { readSavedIds, toggleSaved } from "@/lib/client/saved";
import { Pill } from "@/components/job-card";
import type { JobListing } from "@/lib/domain/types";

export function JobDetail({ listing }: { listing: JobListing }) {
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSaved(readSavedIds().includes(listing.id));
  }, [listing.id]);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-[13px] text-mist">
          <ArrowLeft size={16} />
          Discover
        </Link>
        <button
          type="button"
          onClick={() => setSaved(toggleSaved(listing.id).includes(listing.id))}
          className="glass flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] text-ivory"
        >
          <Bookmark size={14} fill={saved ? "currentColor" : "none"} />
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      <section className="glass rounded-[28px] p-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.04] text-[13px] whisper">
          {companyInitials(listing.company)}
        </div>
        <h1 className="mt-5 text-[28px] font-semibold leading-8 text-ivory">
          {listing.title}
        </h1>
        <p className="mt-2 text-[15px] text-mist">{listing.company}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          <Pill>{listing.platformName}</Pill>
          <Pill>{listing.location}</Pill>
          <Pill className="capitalize">{listing.workMode}</Pill>
          {listing.salary ? <Pill>{listing.salary}</Pill> : null}
        </div>
        <p className="mt-5 text-[13px] text-ash">
          Posted {formatRelative(listing.postedAt)}
        </p>
        <p className="mt-6 text-[15px] leading-7 text-ivory/80">
          {listing.excerpt || "The source did not provide a usable excerpt."}
        </p>
        <a
          href={listing.url}
          target="_blank"
          rel="noreferrer"
          className="mt-8 flex min-h-12 items-center justify-center gap-2 rounded-full bg-ivory text-[15px] font-medium text-obsidian"
        >
          Open on {listing.platformName}
          <ArrowUpRight size={16} />
        </a>
        <p className="mt-4 text-center text-[11px] leading-5 text-ash">
          Application happens on the original board. OpTracker does not invent
          descriptions or apply on your behalf.
        </p>
      </section>
    </div>
  );
}
