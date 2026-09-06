import Link from "next/link";
import { EmptyState } from "@/components/states";

export default function NotFound() {
  return (
    <EmptyState
      title="This page is not here."
      body="The route does not exist."
      action={
        <Link href="/" className="pressable text-[14px] text-ivory">
          Back to Roles
        </Link>
      }
    />
  );
}
