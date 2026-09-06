export function SkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="hairline-x py-3.5">
          <div className="skeleton h-3.5 w-2/3 rounded-sm" />
          <div className="skeleton mt-2 h-3 w-2/5 rounded-sm" />
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
    <div className="pt-8">
      <h2 className="text-[20px] font-medium tracking-[-0.03em] text-ivory">{title}</h2>
      <p className="mt-2 max-w-[280px] text-[14px] leading-6 text-ash">{body}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Unavailable.",
  body,
  onRetry,
}: {
  title?: string;
  body: string;
  onRetry?: () => void;
}) {
  return (
    <div className="pt-8">
      <h2 className="text-[20px] font-medium tracking-[-0.03em] text-ivory">{title}</h2>
      <p className="mt-2 max-w-[280px] text-[14px] leading-6 text-ash">{body}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="pressable mt-5 text-[14px] text-ivory"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
