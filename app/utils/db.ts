import type { Vehicle, Price } from "~/types/vehicle";
import type { Bank, VehicleDBSchema } from "~/types/bank";

const DB_NAME = "bankomoto";
const DB_VERSION = 1;

export const STORES = {
  VEHICLES: "vehicles",
  PRICES: "prices",
  BANKS: "banks",
} as const;

interface BankomotoDB extends IDBDatabase {
  transaction(
    storeNames:
      | (typeof STORES)[keyof typeof STORES][]
      | (typeof STORES)[keyof typeof STORES],
    mode?: IDBTransactionMode
  ): IDBTransaction;
}

export type VehicleFilters = {
  make?: string;
  model?: string;
  year?: number;
  minPrice?: number;
  maxPrice?: number;
  bank?: string;
  color?: string;
};

export async function openDB(): Promise<BankomotoDB> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;

      // Create banks store with indexes
      if (!db.objectStoreNames.contains(STORES.BANKS)) {
        const banksStore = db.createObjectStore(STORES.BANKS, {
          keyPath: "id",
        });
        banksStore.createIndex("name", "name", { unique: false });
      }

      // Create vehicles store with indexes
      if (!db.objectStoreNames.contains(STORES.VEHICLES)) {
        const vehiclesStore = db.createObjectStore(STORES.VEHICLES, {
          keyPath: "id",
        });
        vehiclesStore.createIndex("make", "make", { unique: false });
        vehiclesStore.createIndex("model", "model", { unique: false });
        vehiclesStore.createIndex("year", "year", { unique: false });
      }

      // Create prices store with indexes
      if (!db.objectStoreNames.contains(STORES.PRICES)) {
        const pricesStore = db.createObjectStore(STORES.PRICES, {
          keyPath: "id",
        });
        pricesStore.createIndex("vehicleId", "vehicleId", { unique: false });
        pricesStore.createIndex("bankId", "bankId", { unique: false });
        pricesStore.createIndex("color", "color", { unique: false });
      }
    };
  });
}

export async function getVehicleById(
  id: string
): Promise<{ vehicle: Vehicle; prices: Price[]; bank: Bank } | null> {
  const db = await openDB();
  const tx = db.transaction(
    [STORES.VEHICLES, STORES.PRICES, STORES.BANKS],
    "readonly"
  );

  try {
    // Get vehicle
    const vehicle = await new Promise<Vehicle>((resolve, reject) => {
      const request = tx.objectStore(STORES.VEHICLES).get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (!vehicle) return null;

    // Get prices for vehicle
    const prices = await new Promise<Price[]>((resolve, reject) => {
      const request = tx
        .objectStore(STORES.PRICES)
        .index("vehicleId")
        .getAll(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (!prices.length) return null;

    // Get bank info for the first price
    const bank = await new Promise<Bank>((resolve, reject) => {
      const request = tx.objectStore(STORES.BANKS).get(prices[0].bankId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (!bank) return null;
    return { vehicle, prices, bank };
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return null;
  }
}

export async function getVehicles(
  filters: VehicleFilters = {}
): Promise<(Vehicle & { prices: Price[] })[]> {
  const db = await openDB();
  const tx = db.transaction([STORES.VEHICLES, STORES.PRICES], "readonly");
  const vehiclesStore = tx.objectStore(STORES.VEHICLES);
  const pricesStore = tx.objectStore(STORES.PRICES);

  return new Promise((resolve, reject) => {
    const request = vehiclesStore.getAll();

    request.onsuccess = async () => {
      const vehicles = request.result as Vehicle[];
      const results = [];

      for (const vehicle of vehicles) {
        // Get prices for this vehicle
        const prices = await new Promise<Price[]>((resolve) => {
          const priceRequest = pricesStore
            .index("vehicleId")
            .getAll(vehicle.id);
          priceRequest.onsuccess = () => resolve(priceRequest.result);
          priceRequest.onerror = () => resolve([]);
        });

        // Apply filters
        if (
          filters.make &&
          vehicle.make.toLowerCase() !== filters.make.toLowerCase()
        ) {
          continue;
        }
        if (
          filters.model &&
          !vehicle.model.toLowerCase().includes(filters.model.toLowerCase())
        ) {
          continue;
        }
        if (filters.year && vehicle.year !== filters.year) {
          continue;
        }
        if (
          filters.color &&
          !prices.some(
            (p) => p.color?.toLowerCase() === filters.color?.toLowerCase()
          )
        ) {
          continue;
        }
        if (filters.bank && !prices.some((p) => p.bankId === filters.bank)) {
          continue;
        }
        if (
          filters.minPrice &&
          !prices.some((p) => p.price && p.price >= filters.minPrice!)
        ) {
          continue;
        }
        if (
          filters.maxPrice &&
          !prices.some((p) => p.price && p.price <= filters.maxPrice!)
        ) {
          continue;
        }

        results.push({ ...vehicle, prices });
      }

      resolve(results);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getBankById(id: string): Promise<Bank | null> {
  const db = await openDB();
  const tx = db.transaction(STORES.BANKS, "readonly");

  return new Promise((resolve, reject) => {
    const request = tx.objectStore(STORES.BANKS).get(id);
    request.onsuccess = () => resolve(request.result || null);
    request.onerror = () => reject(request.error);
  });
}

export async function isDBInitialized(): Promise<boolean> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORES.VEHICLES, "readonly");
    const store = tx.objectStore(STORES.VEHICLES);
    const count = await new Promise<number>((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return count > 0;
  } catch (error) {
    console.error("Error checking DB initialization:", error);
    return false;
  }
}
