import Link from "next/link";
import { companyInitials, formatRelative } from "@/lib/domain/text";
import type { JobListing } from "@/lib/domain/types";

export function JobCard({ listing }: { listing: JobListing }) {
  return (
    <Link
      href={`/jobs/${encodeURIComponent(listing.id)}`}
      aria-label={`${listing.title} at ${listing.company}`}
      className="panel lift block rounded-[22px] p-4"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/[0.04] text-[12px] font-medium text-ivory whisper">
          {companyInitials(listing.company)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="line-clamp-2 text-[16px] font-semibold leading-5 text-ivory">
              {listing.title}
            </h3>
            <span className="w-12 shrink-0 text-right text-[11px] text-ash">
              {formatRelative(listing.postedAt)}
            </span>
          </div>
          <p className="mt-1 truncate text-[13px] text-mist">{listing.company}</p>
          <p className="mt-3 line-clamp-2 min-h-10 text-[13px] leading-5 text-ash">
            {listing.excerpt || "No excerpt provided by the source."}
          </p>
          <div className="mt-3 flex min-h-5 flex-wrap items-center gap-1.5">
            <Pill>{listing.platformName}</Pill>
            <Pill>{listing.location}</Pill>
            <Pill className="capitalize">{listing.workMode}</Pill>
          </div>
        </div>
      </div>
    </Link>
  );
}

export function Pill({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[11px] text-mist whisper ${className}`}
    >
      {children}
    </span>
  );
}
