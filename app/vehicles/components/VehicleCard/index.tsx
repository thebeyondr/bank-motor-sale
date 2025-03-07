import React from "react";
import type { VehicleWithPrices } from "~/types/vehicle";
import { BankTabs } from "./BankTabs";
import { PriceDisplay } from "./PriceDisplay";
import { ColorIndicator } from "../shared/ColorIndicator";
import { ViewAndBidDetailsModal } from "../shared/ViewAndBidDetailsModal";

interface VehicleCardProps {
  vehicle: VehicleWithPrices;
  bankNames: Record<string, string>;
}

export function VehicleCard({ vehicle, bankNames }: VehicleCardProps) {
  const [selectedBankId, setSelectedBankId] = React.useState(
    vehicle.prices[0]?.bankId
  );
  const selectedPrice = vehicle.prices.find((p) => p.bankId === selectedBankId);

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 max-w-xl">
      {/* Vehicle Title */}
      <h3 className="text-xl font-bold px-6 pt-6 pb-4 text-gray-900 dark:text-white">
        {vehicle.year} {vehicle.make} {vehicle.model}
      </h3>

      {/* Bank Tabs */}
      <BankTabs
        prices={vehicle.prices}
        bankNames={bankNames}
        selectedBankId={selectedBankId}
        onSelectBank={setSelectedBankId}
      />

      {/* Price and Details Section */}
      <div className="p-6 space-y-4">
        {selectedPrice && (
          <>
            <PriceDisplay price={selectedPrice.price} />

            {/* Color and Availability */}
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
              <ColorIndicator color={selectedPrice.color || "Unknown"} />
              <span>{selectedPrice.color || "Color undisclosed"}</span>
              <span className="text-gray-400 dark:text-gray-500 text-xl">
                •
              </span>
              <span>
                {selectedPrice.amount > 1
                  ? `${selectedPrice.amount} available`
                  : "1 available"}
              </span>
            </div>

            {/* Bank Details Link */}
            <ViewAndBidDetailsModal bankId={selectedPrice.bankId} />
          </>
        )}
      </div>
    </div>
  );
}
