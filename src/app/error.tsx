"use client";

import { ErrorState } from "@/components/states";

export default function ErrorView({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      title="Could not render."
      body="Try again. Nothing was invented to fill the gap."
      onRetry={reset}
    />
  );
}
