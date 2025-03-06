export function LoadingSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <tr key={i}>
          <td colSpan={5} className="py-4 px-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
            </div>
          </td>
        </tr>
      ))}
    </>
  );
}
