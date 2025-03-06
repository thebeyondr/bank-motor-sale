import type { VehicleWithPrices } from "~/types/vehicle";
import { TableHeader } from "./TableHeader";
import { TableRow } from "./TableRow";
import { LoadingSkeleton } from "./LoadingSkeleton";

interface VehicleTableProps {
  vehicles: VehicleWithPrices[];
  isLoading: boolean;
  bankNames: Record<string, string>;
}

export function VehicleTable({
  vehicles,
  isLoading,
  bankNames,
}: VehicleTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full" role="grid" aria-label="Vehicle listings">
        <TableHeader />
        <tbody>
          {isLoading ? (
            <LoadingSkeleton />
          ) : vehicles.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-12 text-center">
                <p className="text-slate-600 dark:text-slate-300 text-lg">
                  No vehicles found matching your criteria
                </p>
              </td>
            </tr>
          ) : (
            vehicles.map((vehicle) => (
              <TableRow
                key={vehicle.id}
                vehicle={vehicle}
                bankNames={bankNames}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
