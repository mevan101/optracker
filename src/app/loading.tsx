export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="mb-6 min-h-[92px]">
        <div className="skeleton h-3 w-20 rounded-full" />
        <div className="skeleton mt-4 h-8 w-40 rounded-full" />
        <div className="skeleton mt-3 h-3 w-56 rounded-full" />
      </div>
      <div className="panel min-h-12 rounded-full" />
      <div className="mt-5 space-y-3">
        <div className="panel min-h-[148px] rounded-[22px]" />
        <div className="panel min-h-[148px] rounded-[22px]" />
      </div>
    </div>
  );
}
