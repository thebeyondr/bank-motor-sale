import type { UUID } from "./vehicle";

export type ContactInfo = {
  phones: string[];
  emails: string[];
  address: string;
  website: string;
};

export type OperatingHours = {
  weekdays: string;
  weekends: string;
};

// Banks store (Primary key: id, Indexes: name)
export interface Bank {
  id: UUID;
  name: string;
  viewInstructions: string;
  saleTerms: string;
  bidInstructions: string;
  contactInfo: {
    phones: string[];
    emails: string[];
    address: string;
    website: string;
  };
  operatingHours: {
    weekdays: string;
    weekends: string;
  };
}

// IndexedDB Database Schema
export interface VehicleDBSchema {
  vehicles: Vehicle; // Table: vehicles
  prices: Price; // Table: prices
  banks: Bank; // Table: banks
}
