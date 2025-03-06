import type { Vehicle, Price } from "~/types/vehicle";
import type { Bank } from "~/types/bank";
import { openDB, STORES, isDBInitialized } from "./db";
import vehicleAndBankData from "../../data/data.json";

type InitializationStatus = {
  success: boolean;
  error?: string;
  vehiclesCount?: number;
  pricesCount?: number;
  banksCount?: number;
};

export async function initializeDatabase(): Promise<InitializationStatus> {
  try {
    // Check if DB is already initialized
    const isInitialized = await isDBInitialized();
    if (isInitialized) {
      return { success: true };
    }

    const db = await openDB();

    // Start a single transaction for all stores
    const tx = db.transaction(
      [STORES.BANKS, STORES.VEHICLES, STORES.PRICES],
      "readwrite"
    );

    // Setup promise handlers for transaction completion
    const txComplete = new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(new Error("Transaction aborted"));
    });

    const banksStore = tx.objectStore(STORES.BANKS);
    const vehiclesStore = tx.objectStore(STORES.VEHICLES);
    const pricesStore = tx.objectStore(STORES.PRICES);

    // Add all banks
    for (const bank of vehicleAndBankData.banks) {
      banksStore.add(bank);
    }

    // Add all vehicles
    for (const vehicle of vehicleAndBankData.vehicles) {
      vehiclesStore.add(vehicle);
    }

    // Add all prices
    for (const price of vehicleAndBankData.prices) {
      pricesStore.add(price);
    }

    // Wait for transaction to complete
    await txComplete;

    return {
      success: true,
      vehiclesCount: vehicleAndBankData.vehicles.length,
      pricesCount: vehicleAndBankData.prices.length,
      banksCount: vehicleAndBankData.banks.length,
    };
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
