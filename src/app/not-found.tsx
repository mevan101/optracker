import Link from "next/link";
import { EmptyState } from "@/components/states";

export default function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      body="That route does not exist."
      action={
        <Link href="/" className="ghost pressable text-ivory">
          Back to Roles
        </Link>
      }
    />
  );
}
