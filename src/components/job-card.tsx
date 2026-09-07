import Link from "next/link";
import { formatRelative, workModeLabel } from "@/lib/domain/text";
import type { JobListing } from "@/lib/domain/types";

export function JobCard({ listing }: { listing: JobListing }) {
  const mode = workModeLabel(listing.workMode);

  return (
    <Link
      href={`/jobs/${encodeURIComponent(listing.id)}`}
      aria-label={`${listing.title} at ${listing.company}`}
      className="row hairline-x block py-[18px]"
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="min-w-0 text-[16.5px] font-medium leading-[1.25] tracking-[-0.025em] text-ivory">
          {listing.title}
        </h3>
        <time className="shrink-0 pt-0.5 text-[12px] tabular-nums text-ash">
          {formatRelative(listing.postedAt)}
        </time>
      </div>
      <p className="mt-1.5 truncate text-[13.5px] leading-5 text-mist">{listing.company}</p>
      <p className="mt-0.5 flex items-center justify-between gap-3 text-[12.5px] leading-5 text-ash">
        <span className="min-w-0 truncate">
          {listing.location}
          <span className="text-ash/70"> · </span>
          {listing.platformName}
        </span>
        {mode ? <span className="shrink-0 tabular-nums">{mode}</span> : null}
      </p>
    </Link>
  );
}
