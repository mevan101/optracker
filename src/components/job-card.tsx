import Link from "next/link";
import { formatRelative } from "@/lib/domain/text";
import type { JobListing } from "@/lib/domain/types";

export function JobCard({ listing }: { listing: JobListing }) {
  return (
    <Link
      href={`/jobs/${encodeURIComponent(listing.id)}`}
      aria-label={`${listing.title} at ${listing.company}`}
      className="row hairline-x block py-3.5"
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="min-w-0 truncate text-[16px] font-medium leading-5 tracking-[-0.03em] text-ivory">
          {listing.title}
        </h3>
        <time className="shrink-0 text-[12px] text-ash">
          {formatRelative(listing.postedAt)}
        </time>
      </div>
      <p className="mt-1 truncate text-[13px] leading-5 text-ash">
        {listing.company}
        <span className="text-ash/70"> · </span>
        {listing.location}
        <span className="text-ash/70"> · </span>
        {listing.platformName}
      </p>
    </Link>
  );
}

export function MetaLine({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] leading-5 text-ash">{children}</p>;
}
