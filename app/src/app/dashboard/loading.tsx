export default function DashboardLoading() {
  return (
    <div className="animate-pulse space-y-8">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-3">
          <div className="h-10 w-72 bg-[var(--color-surface-200)] rounded-2xl" />
          <div className="h-5 w-96 bg-[var(--color-surface-200)] rounded-xl" />
        </div>
        <div className="h-12 w-48 bg-[var(--color-surface-200)] rounded-2xl" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="h-48 bg-[var(--color-surface-100)] border border-dashed border-[var(--color-surface-300)] rounded-3xl" />
          <div className="space-y-4">
            <div className="h-6 w-48 bg-[var(--color-surface-200)] rounded-xl" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-[var(--color-surface-100)] rounded-2xl border border-[var(--color-surface-200)]">
                <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-200)]" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 bg-[var(--color-surface-200)] rounded-full" />
                  <div className="h-3 w-1/3 bg-[var(--color-surface-200)] rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-6">
          <div className="glass-card p-6 rounded-3xl border border-[var(--color-surface-300)]">
            <div className="h-4 w-32 bg-[var(--color-surface-200)] rounded mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-[var(--color-surface-200)] rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
