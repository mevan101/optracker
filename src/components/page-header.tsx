export function PageHeader({
  title,
  meta,
}: {
  title: string;
  meta?: React.ReactNode;
}) {
  return (
    <header className="mb-8 flex items-end justify-between gap-4">
      <h1 className="font-display text-[34px] font-normal leading-[0.95] tracking-[-0.03em] text-ivory">
        {title}
      </h1>
      {meta != null ? (
        <p className="pb-0.5 text-[13px] tabular-nums text-mist">{meta}</p>
      ) : null}
    </header>
  );
}
