export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="glass rounded-[22px] p-4">
          <div className="flex gap-3">
            <div className="skeleton h-11 w-11 rounded-2xl" />
            <div className="flex-1 space-y-2">
              <div className="skeleton h-3 w-2/3 rounded-full" />
              <div className="skeleton h-3 w-1/3 rounded-full" />
              <div className="skeleton mt-3 h-3 w-full rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="glass rounded-[28px] px-6 py-10 text-center">
      <div className="mx-auto mb-5 h-10 w-10 rounded-full whisper" />
      <h2 className="text-[20px] font-semibold text-ivory">{title}</h2>
      <p className="mx-auto mt-2 max-w-[280px] text-[14px] leading-6 text-mist">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Something stayed dark",
  body,
  onRetry,
}: {
  title?: string;
  body: string;
  onRetry?: () => void;
}) {
  return (
    <div className="glass rounded-[28px] px-6 py-10 text-center">
      <p className="text-[11px] uppercase tracking-[0.18em] text-mist">Unavailable</p>
      <h2 className="mt-3 text-[20px] font-semibold text-ivory">{title}</h2>
      <p className="mx-auto mt-2 max-w-[280px] text-[14px] leading-6 text-mist">{body}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="glass-strong mt-6 rounded-full px-5 py-2 text-[13px] text-ivory"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
