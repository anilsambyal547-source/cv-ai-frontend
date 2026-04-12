export function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-white/5 border border-white/10"
          />
        ))}
      </div>
      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-72 rounded-2xl bg-white/5 border border-white/10"
          />
        ))}
      </div>
      {/* Widgets row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[...Array(2)].map((_, i) => (
          <div
            key={i}
            className="h-80 rounded-2xl bg-white/5 border border-white/10"
          />
        ))}
      </div>
    </div>
  );
}