import React from "react";
import { Link } from "@remix-run/react";
import { Badge } from "~/shadcn/ui/Badge";
import { Button } from "~/shadcn/ui/Button";
import { Card, CardContent, CardFooter, CardHeader } from "~/shadcn/ui/Card";
import { Separator } from "~/shadcn/ui/Separator";
import {
  Calendar,
  MapPin,
  DollarSign,
  Gauge,
  Eye,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";

interface Vehicle {
  _id: string;
  make: string;
  model: string;
  year: number;
  slug: string;
  fuelType?: string;
  bodyType?: string;
  driveTrain?: string;
}

interface Bank {
  _id: string;
  name: string;
  slug: string;
  isActive: boolean;
  contactInfo: {
    primaryPhone: string;
    primaryEmail: string;
  };
}

interface Country {
  _id: string;
  name: string;
  code: string;
  currency: string;
}

interface Listing {
  _id: string;
  price?: number;
  currency?: string;
  mileage?: number;
  color?: string;
  condition?: string;
  coverImageUrl?: string | null;
  status: string;
  vehicle: Vehicle;
  bank: Bank;
  country: Country;
  medianPrice?: number;
  priceDelta?: number | null;
  sampleSize?: number;
}

interface VehicleGridResponsiveProps {
  listings: Listing[];
  isLoading?: boolean;
  emptyStateMessage?: string;
  className?: string;
}

export function VehicleGridResponsive({
  listings,
  isLoading = false,
  emptyStateMessage = "No vehicles found matching your criteria",
  className = "",
}: VehicleGridResponsiveProps) {
  if (isLoading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-gray-200" />
            <CardHeader className="space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-3 bg-gray-200 rounded w-2/3" />
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="h-3 bg-gray-200 rounded" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <Eye className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No vehicles found</h3>
        <p className="text-muted-foreground max-w-md">{emptyStateMessage}</p>
      </div>
    );
  }

  const formatPrice = (price?: number, currency = "JMD") => {
    if (!price) return "Contact Bank";
    return new Intl.NumberFormat("en-JM", {
      style: "currency",
      currency: currency === "JMD" ? "USD" : currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price).replace("$", `${currency} $`);
  };

  const formatMileage = (mileage?: number) => {
    if (!mileage) return "N/A";
    return new Intl.NumberFormat().format(mileage) + " km";
  };

  const getPriceDeltaDisplay = (priceDelta?: number | null, sampleSize?: number) => {
    if (!priceDelta || !sampleSize || sampleSize < 5) return null;
    
    const isPositive = priceDelta > 0;
    const absValue = Math.abs(priceDelta);
    
    return {
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isPositive ? "text-red-600" : "text-green-600",
      text: `${isPositive ? "+" : "-"}${absValue.toFixed(1)}%`,
      label: isPositive ? "Above market" : "Below market"
    };
  };

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}>
      {listings.map((listing) => {
        const { vehicle, bank, country } = listing;
        const priceDeltaInfo = getPriceDeltaDisplay(listing.priceDelta, listing.sampleSize);
        
        return (
          <Card
            key={listing._id}
            className="group overflow-hidden border border-border hover:border-primary/50 transition-all duration-200 hover:shadow-lg"
          >
            {/* Image */}
            <div className="aspect-[4/3] relative overflow-hidden bg-muted">
              {listing.coverImageUrl ? (
                <img
                  src={listing.coverImageUrl}
                  alt={`${vehicle.make} ${vehicle.model} ${vehicle.year}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                  <div className="text-muted-foreground text-center">
                    <div className="text-3xl mb-2">🚗</div>
                    <div className="text-sm">No Image</div>
                  </div>
                </div>
              )}
              
              {/* Price Delta Badge */}
              {priceDeltaInfo && (
                <div className="absolute top-2 left-2">
                  <Badge
                    variant="secondary"
                    className={`${priceDeltaInfo.color} bg-white/90 backdrop-blur-sm`}
                  >
                    <priceDeltaInfo.icon className="w-3 h-3 mr-1" />
                    {priceDeltaInfo.text}
                  </Badge>
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-2 right-2">
                <Badge
                  variant={listing.status === "active" ? "default" : "secondary"}
                  className="bg-white/90 backdrop-blur-sm"
                >
                  {listing.status}
                </Badge>
              </div>
            </div>

            {/* Header */}
            <CardHeader className="pb-3">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg leading-tight">
                  {vehicle.make} {vehicle.model}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {vehicle.year}
                  </span>
                  {listing.mileage && (
                    <span className="flex items-center gap-1">
                      <Gauge className="w-3 h-3" />
                      {formatMileage(listing.mileage)}
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>

            {/* Content */}
            <CardContent className="pb-3">
              <div className="space-y-3">
                {/* Price */}
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className="text-xl font-bold text-primary">
                      {formatPrice(listing.price, listing.currency)}
                    </span>
                  </div>
                  {listing.medianPrice && listing.sampleSize && listing.sampleSize >= 5 && (
                    <p className="text-xs text-muted-foreground">
                      Market median: {formatPrice(listing.medianPrice, listing.currency)}
                    </p>
                  )}
                </div>

                {/* Vehicle Details */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {listing.color && (
                    <div>
                      <span className="text-muted-foreground">Color:</span>
                      <span className="ml-1 font-medium">{listing.color}</span>
                    </div>
                  )}
                  {listing.condition && (
                    <div>
                      <span className="text-muted-foreground">Condition:</span>
                      <span className="ml-1 font-medium capitalize">{listing.condition}</span>
                    </div>
                  )}
                  {vehicle.bodyType && (
                    <div>
                      <span className="text-muted-foreground">Body:</span>
                      <span className="ml-1 font-medium">{vehicle.bodyType}</span>
                    </div>
                  )}
                  {vehicle.fuelType && (
                    <div>
                      <span className="text-muted-foreground">Fuel:</span>
                      <span className="ml-1 font-medium">{vehicle.fuelType}</span>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Bank Info */}
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-3 h-3 text-muted-foreground" />
                  <span className="font-medium">{bank.name}</span>
                  <span className="text-muted-foreground">• {country.name}</span>
                </div>
              </div>
            </CardContent>

            {/* Footer */}
            <CardFooter className="pt-3">
              <Button asChild className="w-full">
                <Link to={`/listing/${listing._id}`}>
                  View Details
                </Link>
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}