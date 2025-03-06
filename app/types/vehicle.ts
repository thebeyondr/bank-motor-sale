// Unique identifier type
export type UUID = string;

// Vehicles store (Primary key: id, Indexes: make, model, year)
export interface Vehicle {
  id: UUID;
  year: number;
  make: string;
  model: string;
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
