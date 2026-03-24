export default function HistoryLoading() {
  return (
    <div className="animate-pulse space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="h-10 w-56 bg-[var(--color-surface-200)] rounded-2xl" />
          <div className="h-5 w-80 bg-[var(--color-surface-200)] rounded-xl" />
        </div>
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card w-24 h-16 rounded-2xl" />
          ))}
        </div>
      </div>

      <div className="glass-card p-4 rounded-2xl h-14" />

      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="glass-card p-6 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-200)]" />
          <div className="flex-1 space-y-2">
            <div className="h-5 w-1/3 bg-[var(--color-surface-200)] rounded-full" />
            <div className="h-3 w-1/4 bg-[var(--color-surface-200)] rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
