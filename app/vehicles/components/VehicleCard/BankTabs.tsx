import type { Price } from "~/types/vehicle";

interface BankTabsProps {
  prices: Price[];
  bankNames: Record<string, string>;
  selectedBankId: string;
  onSelectBank: (bankId: string) => void;
}

export function BankTabs({
  prices,
  bankNames,
  selectedBankId,
  onSelectBank,
}: BankTabsProps) {
  return (
    <div className="relative">
      {/* Scrollable container */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex min-w-full border-b border-gray-200 dark:border-gray-700">
          {prices.map((price) => (
            <button
              key={price.bankId}
              onClick={() => onSelectBank(price.bankId)}
              className={`
                flex-1 min-w-[100px] px-6 py-3 text-base font-medium cursor-pointer
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
                ${
                  selectedBankId === price.bankId
                    ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }
              `}
            >
              {bankNames[price.bankId]}
            </button>
          ))}
        </div>
      </div>

      {/* Fade indicators for scroll */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white dark:from-gray-800 to-transparent pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-gray-800 to-transparent pointer-events-none" />
    </div>
  );
}
