import Link from "next/link";
import { EmptyState } from "@/components/states";

export default function NotFound() {
  return (
    <EmptyState
      title="This page is not here"
      body="The route does not exist. The board itself is unchanged."
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
