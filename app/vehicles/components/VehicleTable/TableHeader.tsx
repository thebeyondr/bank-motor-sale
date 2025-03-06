export function TableHeader() {
  return (
    <thead>
      <tr className="bg-slate-200 dark:bg-slate-800">
        <th
          scope="col"
          className="py-3 px-4 text-left text-slate-600 dark:text-slate-300 font-semibold"
        >
          Vehicle
        </th>
        <th
          scope="col"
          className="py-3 px-4 text-left text-slate-600 dark:text-slate-300 font-semibold"
        >
          Color
        </th>
        <th
          scope="col"
          className="py-3 px-4 text-left text-slate-600 dark:text-slate-300 font-semibold"
        >
          Bank
        </th>
        <th
          scope="col"
          className="py-3 px-4 text-left text-slate-600 dark:text-slate-300 font-semibold"
        >
          Price
        </th>
        <th
          scope="col"
          className="py-3 px-4 text-left text-slate-600 dark:text-slate-300 font-semibold"
        >
          Available
        </th>
      </tr>
    </thead>
  );
}
