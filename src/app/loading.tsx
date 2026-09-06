export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="mb-8 flex justify-between">
        <div className="skeleton h-8 w-28 rounded-sm" />
        <div className="skeleton h-3 w-6 rounded-sm" />
      </div>
      <div className="skeleton mb-4 h-11 w-full rounded-[12px]" />
      <div className="skeleton mb-5 h-10 w-full rounded-[12px]" />
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="hairline-x py-[18px]">
          <div className="skeleton h-3.5 w-3/5 rounded-sm" />
          <div className="skeleton mt-2.5 h-3 w-2/5 rounded-sm" />
          <div className="skeleton mt-2 h-2.5 w-1/3 rounded-sm" />
        </div>
      ))}
    </div>
  );
}
