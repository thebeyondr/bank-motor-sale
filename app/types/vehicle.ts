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
  condition?: "Excellent" | "Good" | "Fair" | "Unknown";
  price: number | null;
  images: Array<{
    url: string;
    isCover: boolean;
    rank?: number;
  }>;
  createdAt: number;
  vehicle: Vehicle;
  bank: Bank;
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
