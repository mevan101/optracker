import type { Metadata } from "next";
import Link from "next/link";
import { JobDetail } from "@/components/job-detail";
import { presentCatalog } from "@/lib/crawl/orchestrator";
import { readCatalog } from "@/lib/store/persistence";
import { EmptyState } from "@/components/states";

export const dynamic = "force-dynamic";
export const revalidate = 0;

function listingFromParam(id: string) {
  const decoded = decodeURIComponent(id);
  const { listings } = presentCatalog(readCatalog());
  return listings.find((item) => item.id === decoded);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const listing = listingFromParam(id);
  if (!listing) {
    return { title: "Role unavailable" };
  }
  return { title: `${listing.title} at ${listing.company}` };
}

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = listingFromParam(id);

  if (!listing) {
    return (
      <EmptyState
        title="This role is gone"
        body="It is missing, expired, or was filtered out."
        action={
          <Link href="/" className="ghost pressable text-ivory">
            Back to Roles
          </Link>
        }
      />
    );
  }

  return <JobDetail listing={listing} />;
}
