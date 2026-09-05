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
      title="The board could not be drawn"
      body="A rendering error stayed on this device. Nothing was invented to fill the gap."
      onRetry={reset}
    />
  );
}
