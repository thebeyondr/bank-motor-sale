import vehicleAndBankData from "../../data/data.json";
import {
  DB_VERSION,
  DB_VERSION_KEY,
  deleteDatabase,
  isDBInitialized,
  openDB,
  STORES,
  validateDatabase,
} from "./db";

type InitializationStatus = {
  success: boolean;
  error?: string;
  vehiclesCount?: number;
  pricesCount?: number;
  banksCount?: number;
  wasRecreated?: boolean;
};

async function populateDatabase(): Promise<InitializationStatus> {
  const db = await openDB();

  // Start a single transaction for all stores
  const tx = db.transaction(
    [STORES.METADATA, STORES.BANKS, STORES.VEHICLES, STORES.PRICES],
    "readwrite"
  );

  // Setup promise handlers for transaction completion
  const txComplete = new Promise<void>((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(new Error("Transaction aborted"));
  });

  const metadataStore = tx.objectStore(STORES.METADATA);
  const banksStore = tx.objectStore(STORES.BANKS);
  const vehiclesStore = tx.objectStore(STORES.VEHICLES);
  const pricesStore = tx.objectStore(STORES.PRICES);

  // Store the current version using the correct key and version
  metadataStore.put({ key: DB_VERSION_KEY, version: DB_VERSION });

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
}

export async function initializeDatabase(): Promise<InitializationStatus> {
  try {
    // First check if DB exists and is valid
    const validation = await validateDatabase().catch(() => ({
      isValid: false,
      error: "Failed to validate database",
    }));

    // If DB is invalid or doesn't exist, we need to recreate it
    if (!validation.isValid) {
      console.log("Database needs recreation:", validation.error);

      // Try to delete existing database if it exists
      try {
        await deleteDatabase();
      } catch (error) {
        console.warn("Failed to delete existing database:", error);
        // Continue anyway as the next steps will attempt to create a new one
      }

      // Populate with fresh data
      const result = await populateDatabase();
      return { ...result, wasRecreated: true };
    }

    // If DB exists and is valid, check if it's initialized with data
    const isInitialized = await isDBInitialized();
    if (!isInitialized) {
      // DB exists but is empty, populate it
      return await populateDatabase();
    }

    // DB exists, is valid, and has data
    return { success: true };
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
