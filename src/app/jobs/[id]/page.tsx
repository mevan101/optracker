import Link from "next/link";
import { JobDetail } from "@/components/job-detail";
import { presentCatalog } from "@/lib/crawl/orchestrator";
import { readCatalog } from "@/lib/store/persistence";
import { EmptyState } from "@/components/states";

export const dynamic = "force-dynamic";

export default async function JobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const { listings } = presentCatalog(readCatalog());
  const listing = listings.find((item) => item.id === decoded);

  if (!listing) {
    return (
      <EmptyState
        title="This role is gone"
        body="It is missing, expired, or was filtered as broken, mock, or placeholder."
        action={
          <Link
            href="/"
            className="glass-strong inline-flex rounded-full px-5 py-2 text-[13px] text-ivory"
          >
            Return to Discover
          </Link>
        }
      />
    );
  }

  return <JobDetail listing={listing} />;
}
