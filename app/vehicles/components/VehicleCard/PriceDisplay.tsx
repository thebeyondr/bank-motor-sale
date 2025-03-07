import { BadgeDollarSign } from "lucide-react";

interface PriceDisplayProps {
  price: number | null;
}

const priceEmojis = (price: number) => {
  if (!price) {
    return "💰";
  }
  let emoji = "💲";

  if (price >= 50_000_000) {
    emoji = "🤯";
  } else if (price >= 20_000_000) {
    emoji = "🤑";
  } else if (price >= 10_000_000) {
    emoji = "💰";
  } else if (price >= 5_000_000) {
    emoji = "💵";
  }
  return <span className="text-2xl md:text-3xl -mr-2">{emoji}</span>;
};
export function PriceDisplay({ price }: PriceDisplayProps) {
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
    <div className="flex items-center gap-2 text-2xl md:text-3xl font-semibold text-green-700 dark:text-white tracking-tight">
      {formattedPrice}
      {priceEmojis(price)}
    </div>
  );
}
