// Unique identifier type
export type UUID = string;

// Database types
export interface Vehicle {
  id: string;
  make: string;
  model: string;
  year: number;
}

// Prices store (Primary key: id, Indexes: vehicleId, bankId)
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
