// Unique identifier type
export type UUID = string;

// New schema types based on updated Convex schema
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
  slug: string;
  fuelType?: string;
  bodyType?: string;
  driveTrain?: "FWD" | "RWD" | "AWD" | "4WD";
  transmission?: string;
}

export interface Bank {
  id: string;
  name: string;
}

export interface Listing {
  id: string;
  vehicleId: string;
  bankId: string;
  mileage?: number;
  color?: string;
  condition?:
    | "like new"
    | "well maintained"
    | "fair condition"
    | "poorly maintained"
    | "needs work"
    | "unknown";
  price: number | null;
  images: Array<{
    url: string;
    isCover: boolean;
    rank?: number;
  }>;
  createdAt: number;
  vehicle: Vehicle;
  bank: Bank;
  // Market stats
  medianPrice?: number;
  priceDelta?: number | null;
  sampleSize?: number;
}

// Legacy types for backward compatibility
export interface Price {
  id: UUID;
  vehicleId: UUID; // Foreign key to Vehicle
  bankId: UUID; // Foreign key to Bank
  price: number | null;
  amount: number;
  color?: string;
}

// UI types
export interface VehicleWithPrices extends Vehicle {
  prices: Array<Price>;
}
