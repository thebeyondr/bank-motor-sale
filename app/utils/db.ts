import type { PriceBySource, Vehicle } from "~/types/vehicle";
import type { Bank } from "~/types/bank";

const DB_NAME = "bankomoto";
const DB_VERSION = 1;

export const STORES = {
  VEHICLES: "vehicles",
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
        vehiclesStore.createIndex("color", "color", { unique: false });
        vehiclesStore.createIndex("sources", "sources", {
          unique: false,
          multiEntry: true,
        });
      }
    };
  });
}

export async function getVehicleById(
  id: string
): Promise<{ vehicle: Vehicle; bank: Bank } | null> {
  const db = await openDB();
  const tx = db.transaction([STORES.VEHICLES, STORES.BANKS], "readonly");

  try {
    // Get vehicle
    const vehicle = await new Promise<Vehicle>((resolve, reject) => {
      const request = tx.objectStore(STORES.VEHICLES).get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (!vehicle) return null;

    // Get bank info for the first source
    const bankId = Object.keys(vehicle.pricesBySource)[0];
    if (!bankId) return null;

    const bank = await new Promise<Bank>((resolve, reject) => {
      const request = tx.objectStore(STORES.BANKS).get(bankId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });

    if (!bank) return null;
    return { vehicle, bank };
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return null;
  }
}

export async function getVehicles(
  filters: VehicleFilters = {}
): Promise<Vehicle[]> {
  const db = await openDB();
  const tx = db.transaction(STORES.VEHICLES, "readonly");
  const store = tx.objectStore(STORES.VEHICLES);

  return new Promise((resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => {
      const results = (request.result as Vehicle[]).filter((vehicle) => {
        if (
          filters.make &&
          vehicle.make.toLowerCase() !== filters.make.toLowerCase()
        ) {
          return false;
        }
        if (
          filters.model &&
          !vehicle.model.toLowerCase().includes(filters.model.toLowerCase())
        ) {
          return false;
        }
        if (
          filters.color &&
          vehicle.color.toLowerCase() !== filters.color.toLowerCase()
        ) {
          return false;
        }
        if (filters.year && vehicle.year !== filters.year) {
          return false;
        }
        if (filters.bank && !vehicle.sources.includes(filters.bank)) {
          return false;
        }
        if (
          filters.minPrice &&
          !Object.values(vehicle.pricesBySource).some(
            (priceInfo: PriceBySource) =>
              priceInfo.price && priceInfo.price >= filters.minPrice!
          )
        ) {
          return false;
        }
        if (
          filters.maxPrice &&
          !Object.values(vehicle.pricesBySource).some(
            (priceInfo: PriceBySource) =>
              priceInfo.price && priceInfo.price <= filters.maxPrice!
          )
        ) {
          return false;
        }
        return true;
      });

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
