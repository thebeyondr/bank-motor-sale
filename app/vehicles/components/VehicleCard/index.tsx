import * as React from "react";
import { Card, CardContent } from "~/shadcn/ui/Card";
import { cn } from "~/utils/tw-merge";
import type { Listing, Vehicle, Bank } from "~/types/vehicle";
import { PriceDisplay } from "./PriceDisplay";

export interface VehicleCardProps {
  listing: Listing & {
    vehicle: Vehicle;
    bank: Bank;
    stats?: {
      goingRate: number | null;
      percentDiff: number | null;
    };
  };
  saved?: boolean;
  onToggleSave?: () => void;
}

const formatCondition = (condition: string | undefined) => {
  if (!condition) return "Unknown";
  return condition
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

const displayDiffFromRate = (diff: number, isBelowRate: boolean) => {
  if (diff === 0) return null;
  if (Math.abs(diff) < 0.05) return null;

  const icon = isBelowRate ? (
    <svg
      width="16"
      height="10"
      viewBox="0 0 16 10"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M14.3219 4.51912C14.1346 4.51912 13.9551 4.5935 13.8227 4.72589C13.6903 4.85828 13.6159 5.03783 13.6159 5.22506V7.05342L9.17561 2.60605C9.10999 2.53988 9.03191 2.48736 8.94588 2.45152C8.85986 2.41569 8.76759 2.39723 8.6744 2.39723C8.58121 2.39723 8.48894 2.41569 8.40291 2.45152C8.31689 2.48736 8.23881 2.53988 8.17319 2.60605L5.85067 4.93563L2.11628 1.19418C1.98335 1.06125 1.80306 0.986572 1.61507 0.986572C1.42708 0.986572 1.24679 1.06125 1.11386 1.19418C0.980929 1.32711 0.90625 1.5074 0.90625 1.69539C0.90625 1.88338 0.980929 2.06368 1.11386 2.19661L5.34946 6.4322C5.41508 6.49837 5.49316 6.55089 5.57918 6.58673C5.66521 6.62256 5.75748 6.64102 5.85067 6.64102C5.94386 6.64102 6.03613 6.62256 6.12215 6.58673C6.20818 6.55089 6.28626 6.49837 6.35188 6.4322L8.6744 4.10262L12.6206 8.04879H10.7922C10.605 8.04879 10.4254 8.12316 10.293 8.25555C10.1606 8.38794 10.0863 8.5675 10.0863 8.75472C10.0863 8.94195 10.1606 9.1215 10.293 9.25389C10.4254 9.38628 10.605 9.46065 10.7922 9.46065H14.3219C14.4141 9.45954 14.5052 9.44035 14.5901 9.40418C14.7626 9.33254 14.8997 9.19547 14.9713 9.02298C15.0075 8.93811 15.0267 8.84697 15.0278 8.75472V5.22506C15.0278 5.03783 14.9534 4.85828 14.821 4.72589C14.6886 4.5935 14.5091 4.51912 14.3219 4.51912Z"
        fill="#D5F9E3"
      />
    </svg>
  ) : (
    <svg
      width="11"
      height="6"
      viewBox="0 0 11 6"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.62617 0.585952C6.62617 0.430548 6.68791 0.281509 6.79779 0.171622C6.90768 0.0617343 7.05672 0 7.21212 0H9.94657C10.102 0 10.251 0.0617343 10.3609 0.171622C10.4708 0.281509 10.5325 0.430548 10.5325 0.585952V3.32039C10.5325 3.4758 10.4708 3.62484 10.3609 3.73472C10.251 3.84461 10.102 3.90635 9.94657 3.90635C9.79116 3.90635 9.64212 3.84461 9.53224 3.73472C9.42235 3.62484 9.36061 3.4758 9.36061 3.32039V2.00005L5.67302 5.68764C5.56316 5.79737 5.41423 5.859 5.25895 5.859C5.10367 5.859 4.95475 5.79737 4.84488 5.68764L2.91514 3.75791L0.985409 5.68764C0.874332 5.79114 0.727417 5.84749 0.575615 5.84481C0.423814 5.84213 0.278978 5.78064 0.171621 5.67328C0.0642647 5.56593 0.00276965 5.42109 9.12892e-05 5.26929C-0.00258707 5.11749 0.0537604 4.97057 0.157263 4.85949L2.50107 2.51569C2.61094 2.40596 2.75987 2.34432 2.91514 2.34432C3.07042 2.34432 3.21935 2.40596 3.32922 2.51569L5.25895 4.44542L8.53247 1.1719H7.21212C7.05672 1.1719 6.90768 1.11017 6.79779 1.00028C6.68791 0.890395 6.62617 0.741356 6.62617 0.585952Z"
        fill="#FFD6D6"
      />
    </svg>
  );

  const diffText = isBelowRate ? "below" : "above";
  const diffValue = isBelowRate ? diff : -diff;

  return (
    <div
      className={cn(
        "text-white px-2 py-0.5 rounded-full text-xs font-medium tracking-normal flex items-center gap-1",
        isBelowRate
          ? "bg-gradient-to-br from-green-600 to-green-700"
          : "bg-gradient-to-br from-red-600 to-red-700"
      )}
    >
      {icon}
      {Math.abs(diffValue * 100).toFixed(0)}% {diffText} going rate
    </div>
  );
};

export function VehicleCard({
  listing,
  saved = false,
  onToggleSave,
}: VehicleCardProps) {
  const coverImage = listing.images.find((img) => img.isCover);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card
      className={cn(
        "group p-0 w-sm overflow-hidden bg-card/95 border border-border/20 shadow-lg hover:shadow-xl transition-all duration-300 h-max"
      )}
    >
      <CardContent className="p-0">
        {/* Image Section with Overlay */}
        <div className="relative overflow-hidden rounded-xl shadow-lg">
          <div
            className="group-hover:scale-105 transition-all duration-300 h-64 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: coverImage
                ? `url(${coverImage.url})`
                : undefined,
            }}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 vehicle-info-blur backdrop-blur-sm mt-auto rounded-b-xl h-2/5" />

          {/* Car Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 text-white h-1/3">
            <div className="relative z-10 p-4 pb-6">
              <h3 className="text-2xl font-semibold text-white drop-shadow-sm">
                {listing.vehicle.year} {listing.vehicle.make}{" "}
                {listing.vehicle.model}
              </h3>
              <p className="text-white/90 text-sm drop-shadow tracking-[.03em] font-medium">
                {listing.vehicle.bodyType || "Vehicle"} •{" "}
                {formatCondition(listing.condition)} •{" "}
                {listing.vehicle.fuelType || "Unknown"}
              </p>
            </div>
          </div>

          {/* Top badge */}
          <div className="absolute top-4 left-4">
            <div className="bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
              {listing.bank.name}
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div className="p-6">
          <div className="mb-4">
            <PriceDisplay price={listing.price} />
            {listing.stats?.goingRate !== null && listing.stats && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-muted-foreground text-sm font-medium">
                  Going rate: {formatPrice(listing.stats.goingRate)}
                </span>
                {listing.stats.percentDiff !== null &&
                  Math.abs(listing.stats.percentDiff) >= 0.05 &&
                  displayDiffFromRate(
                    listing.stats.percentDiff,
                    listing.stats.percentDiff < 0
                  )}
              </div>
            )}
          </div>

          {/* Property Badges */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-muted rounded-lg p-2 text-center border border-border/40">
              <div className="text-xs text-muted-foreground font-medium tracking-wide">
                FUEL
              </div>
              <div className="text-sm font-semibold text-foreground/80 mt-1">
                {listing.vehicle.fuelType || "Unknown"}
              </div>
            </div>
            <div className="bg-muted rounded-lg p-2 text-center border border-border/40">
              <div className="text-xs text-muted-foreground font-medium tracking-wide">
                TRANS
              </div>
              <div className="text-sm font-semibold text-foreground/80 mt-1">
                {listing.vehicle.transmission || "Unknown"}
              </div>
            </div>
            <div className="bg-muted rounded-lg p-2 text-center border border-border/40">
              <div className="text-xs text-muted-foreground font-medium tracking-wide">
                COLOR
              </div>
              <div className="text-sm font-semibold text-foreground/80 mt-1">
                {listing.color || "Unknown"}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg flex-1 bg-gradient-to-b from-[#34374A] to-[#232534] text-primary-foreground hover:scale-105 font-semibold py-3 transition-all duration-200 ease-out active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              aria-label={`View listing for ${listing.vehicle.year} ${listing.vehicle.make} ${listing.vehicle.model}`}
              type="button"
            >
              <span className="shadow-sm tracking-[0.02em]">View Listing</span>
            </button>

            <button
              onClick={onToggleSave}
              className={cn(
                "p-3 rounded-lg border-2 transition-all duration-200 hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                saved
                  ? "bg-gradient-to-br from-red-600 to-red-700 border-red-500 text-white shadow-lg"
                  : "bg-background border-border text-muted-foreground hover:border-red-300 hover:text-red-500"
              )}
              aria-label={
                saved
                  ? `Remove ${listing.vehicle.year} ${listing.vehicle.make} ${listing.vehicle.model} from saved vehicles`
                  : `Save ${listing.vehicle.year} ${listing.vehicle.make} ${listing.vehicle.model} to your saved vehicles`
              }
              aria-pressed={saved}
              type="button"
            >
              {saved ? (
                <svg
                  width="23"
                  height="21"
                  viewBox="0 0 23 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M17.646 0.84082C13.8077 0.84082 11.6487 4.03978 11.6487 5.63866C11.6487 4.03978 9.48963 0.84082 5.65136 0.84082C1.81308 0.84082 0.853516 4.03978 0.853516 5.63866C0.853516 14.0349 11.6487 20.0322 11.6487 20.0322C11.6487 20.0322 22.4438 14.0349 22.4438 5.63866C22.4438 4.03978 21.4842 0.84082 17.646 0.84082Z"
                    fill="url(#paint0_linear_116_945)"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_116_945"
                      x1="11.6487"
                      y1="0.84082"
                      x2="11.6487"
                      y2="20.0322"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="white" />
                      <stop offset="1" stopColor="#FDBEBE" />
                    </linearGradient>
                  </defs>
                </svg>
              ) : (
                <svg
                  width="23"
                  height="21"
                  viewBox="0 0 22 21"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M16.8398 0.84082C13.0015 0.84082 10.8425 4.03978 10.8425 5.63866C10.8425 4.03978 8.68348 0.84082 4.84521 0.84082C1.00693 0.84082 0.0473633 4.03978 0.0473633 5.63866C0.0473633 14.0349 10.8425 20.0322 10.8425 20.0322C10.8425 20.0322 21.6377 14.0349 21.6377 5.63866C21.6377 4.03978 20.6781 0.84082 16.8398 0.84082Z"
                    fill="url(#paint0_linear_116_921)"
                  />
                  <defs>
                    <linearGradient
                      id="paint0_linear_116_921"
                      x1="10.8425"
                      y1="0.84082"
                      x2="10.8425"
                      y2="20.0322"
                      gradientUnits="userSpaceOnUse"
                    >
                      <stop stopColor="#9CA0A6" />
                      <stop offset="1" stopColor="#8D8D8D" />
                    </linearGradient>
                  </defs>
                </svg>
              )}
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default VehicleCard;

// Demo component to show both saved and unsaved states
export function VehicleCardDemo() {
  const sampleListing: Listing & {
    vehicle: Vehicle;
    bank: Bank;
    stats?: {
      goingRate: number | null;
      percentDiff: number | null;
    };
  } = {
    id: "1",
    vehicleId: "1",
    bankId: "1",
    price: 3400000,
    images: [
      {
        url: "https://upload.wikimedia.org/wikipedia/commons/f/f3/2012_Hyundai_Tucson_GLS_--_NHTSA_1.jpg",
        isCover: true,
      },
    ],
    createdAt: Date.now(),
    vehicle: {
      id: "1",
      make: "Hyundai",
      model: "Tucson",
      year: 2012,
      slug: "hyundai-tucson-2012",
      fuelType: "Hybrid",
      bodyType: "Compact SUV",
      driveTrain: "FWD",
      transmission: "Auto",
    },
    bank: {
      id: "1",
      name: "NCB",
    },
    stats: {
      goingRate: 3860000,
      percentDiff: -0.12, // 12% below
    },
  };

  const [listings, setListings] = React.useState([
    { ...sampleListing, id: "1", saved: false },
    { ...sampleListing, id: "2", saved: true },
  ]);

  const handleToggleSave = (listingId: string) => {
    setListings((prev) =>
      prev.map((l) => (l.id === listingId ? { ...l, saved: !l.saved } : l))
    );
  };

  return (
    <div className="flex gap-6 p-6 bg-background min-h-screen">
      {listings.map((listing) => (
        <VehicleCard
          key={listing.id}
          listing={listing}
          saved={listing.saved}
          onToggleSave={() => handleToggleSave(listing.id)}
        />
      ))}
    </div>
  );
}
