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
      title="Could not render"
      body="Try again. The board was left as-is."
      onRetry={reset}
    />
  );
}
