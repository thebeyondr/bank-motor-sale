import { BadgeDollarSign } from "lucide-react";

interface PriceDisplayProps {
  price: number | null;
  priceDelta?: number | null;
}

export function PriceDisplay({ price, priceDelta }: PriceDisplayProps) {
  if (!price) {
    return (
      <div className="flex items-center gap-2 text-xl font-semibold text-gray-600 dark:text-white">
        Price undisclosed
      </div>
    );
  }

  const formattedPrice = Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "JMD",
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).format(price);

  return (
    <div className="space-y-2">
      <div className="text-2xl md:text-3xl font-semibold text-green-700 dark:text-white tracking-tight">
        {formattedPrice}
      </div>

      {priceDelta !== null && priceDelta !== undefined && (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
              priceDelta > 0
                ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
            }`}
          >
            {priceDelta > 0 ? "+" : ""}
            {priceDelta.toFixed(1)}% vs similar listings
          </span>
        </div>
      )}
    </div>
  );
}
