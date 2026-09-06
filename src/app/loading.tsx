export default function Loading() {
  return (
    <div aria-busy="true" aria-live="polite">
      <div className="mb-7 flex justify-between">
        <div className="skeleton h-7 w-24 rounded-sm" />
        <div className="skeleton h-3 w-6 rounded-sm" />
      </div>
      <div className="skeleton mb-6 h-6 w-full rounded-sm" />
      {Array.from({ length: 7 }).map((_, index) => (
        <div key={index} className="hairline-x py-3.5">
          <div className="skeleton h-3.5 w-3/5 rounded-sm" />
          <div className="skeleton mt-2 h-3 w-2/5 rounded-sm" />
        </div>
      ))}
    </div>
  );
}
