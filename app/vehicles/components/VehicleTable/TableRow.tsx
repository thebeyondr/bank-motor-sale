import { Link } from "react-router";
import { ColorIndicator } from "../shared/ColorIndicator";
import type { VehicleWithPrices } from "~/types/vehicle";

interface TableRowProps {
  vehicle: VehicleWithPrices;
  bankNames: Record<string, string>;
}

export function TableRow({ vehicle, bankNames }: TableRowProps) {
  return (
    <tr className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors group">
      <td className="py-4 px-4">
        <Link
          to={`/vehicle/${vehicle.id}`}
          className="text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300"
        >
          {vehicle.year} {vehicle.make} {vehicle.model}
        </Link>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center">
          <ColorIndicator
            color={vehicle.prices[0]?.color || "Unknown"}
            className="mr-2"
          />
          <span className="text-gray-600 dark:text-gray-300">
            {vehicle.prices[0]?.color === "Unknown"
              ? "Color undisclosed"
              : vehicle.prices[0]?.color}
          </span>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="text-gray-600 dark:text-gray-300 space-y-1">
          {vehicle.prices.map((price) => (
            <div key={price.id}>{bankNames[price.bankId]}</div>
          ))}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="text-gray-600 dark:text-gray-300 space-y-1">
          {vehicle.prices.map((price) => (
            <div key={price.id}>
              {price.price
                ? Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "JMD",
                    currencySign: "standard",
                    maximumFractionDigits: 0,
                  }).format(price.price)
                : "Price undisclosed"}
            </div>
          ))}
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="text-gray-600 dark:text-gray-300 space-y-1">
          {vehicle.prices.map((price) => (
            <div key={price.id}>
              {price.amount > 1 ? `${price.amount} available` : "1 available"}
            </div>
          ))}
        </div>
      </td>
    </tr>
  );
}
