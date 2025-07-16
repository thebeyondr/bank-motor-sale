import React from "react";
import type { Listing } from "~/types/vehicle";
import { PriceDisplay } from "./PriceDisplay";
import { ColorIndicator } from "../shared/ColorIndicator";
import { ViewAndBidDetailsModal } from "../shared/ViewAndBidDetailsModal";

interface VehicleCardProps {
  listing: Listing;
}

export function VehicleCard({ listing }: VehicleCardProps) {
  const coverImage = listing.images.find((img) => img.isCover);

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700 max-w-xl">
      {/* Vehicle Image */}
      {coverImage && (
        <div className="aspect-video w-full bg-gray-100 dark:bg-gray-700 relative overflow-hidden">
          <img
            src={coverImage.url}
            alt={`${listing.vehicle.year} ${listing.vehicle.make} ${listing.vehicle.model}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Vehicle Title */}
      <h3 className="text-xl font-bold px-6 pt-6 pb-4 text-gray-900 dark:text-white">
        {listing.vehicle.year} {listing.vehicle.make} {listing.vehicle.model}
      </h3>

      {/* Bank Badge */}
      <div className="px-6 pb-4">
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
          {listing.bank.name}
        </span>
      </div>

      {/* Price and Details Section */}
      <div className="p-6 pt-0 space-y-4">
        <PriceDisplay price={listing.price} />

        {/* Vehicle Details */}
        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
          {listing.color && (
            <div className="flex items-center gap-2">
              <ColorIndicator color={listing.color} />
              <span>{listing.color}</span>
            </div>
          )}

          {listing.mileage && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">📊</span>
              <span>{listing.mileage.toLocaleString()} miles</span>
            </div>
          )}

          {listing.condition && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">⭐</span>
              <span>{listing.condition} condition</span>
            </div>
          )}

          {listing.vehicle.fuelType && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">⛽</span>
              <span>{listing.vehicle.fuelType}</span>
            </div>
          )}

          {listing.vehicle.bodyType && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400">🚗</span>
              <span>{listing.vehicle.bodyType}</span>
            </div>
          )}
        </div>

        {/* Bank Details Link */}
        <ViewAndBidDetailsModal bankId={listing.bankId} />
      </div>
    </div>
  );
}
