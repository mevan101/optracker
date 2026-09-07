export function SkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="hairline-x py-[18px]">
          <div className="skeleton h-3.5 w-2/3 rounded-sm" />
          <div className="skeleton mt-2.5 h-3 w-2/5 rounded-sm" />
          <div className="skeleton mt-2 h-2.5 w-1/3 rounded-sm" />
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
    <div className="pt-10">
      <h2 className="font-display text-[26px] font-normal tracking-[-0.025em] text-ivory">
        {title}
      </h2>
      <p className="mt-3 max-w-[280px] text-[14px] leading-6 text-ash">{body}</p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title = "Unavailable",
  body,
  onRetry,
}: {
  title?: string;
  body: string;
  onRetry?: () => void;
}) {
  return (
    <div className="pt-10">
      <h2 className="font-display text-[26px] font-normal tracking-[-0.025em] text-ivory">
        {title}
      </h2>
      <p className="mt-3 max-w-[280px] text-[14px] leading-6 text-ash">{body}</p>
      {onRetry ? (
        <button type="button" onClick={onRetry} className="ghost pressable mt-6 text-ivory">
          Try again
        </button>
      ) : null}
    </div>
  );
}
