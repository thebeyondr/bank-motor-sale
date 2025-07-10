export function VehicleCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="h-48 bg-slate-200 dark:bg-slate-700" />
      <div className="p-4 space-y-3">
        <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2" />
        <div className="space-y-2">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3" />
        </div>
      </div>
    </div>
  );
}

export function VehicleGridSkeleton() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <VehicleCardSkeleton key={i} />
      ))}
    </>
  );
}

export function FilterSkeleton() {
  return (
    <div className="bg-blue-50 dark:bg-slate-800 p-6 rounded-lg mb-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
