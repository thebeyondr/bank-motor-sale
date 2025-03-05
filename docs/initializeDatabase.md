# Optimized Data Loading

```typescript

async function initializeDatabase(parsedData: {
  banks: Bank[],
  vehicles: VehicleRecord[]
}) {
  const db = await openIndexedDB();
  
  // Start transactions
  const bankTransaction = db.transaction(['banks'], 'readwrite');
  const vehicleTransaction = db.transaction(['vehicles'], 'readwrite');
  
  const bankStore = bankTransaction.objectStore('banks');
  const vehicleStore = vehicleTransaction.objectStore('vehicles');
  
  // Batch add banks
  parsedData.banks.forEach(bank => {
    bankStore.put(bank);
  });
  
  // Batch add vehicles
  parsedData.vehicles.forEach(vehicle => {
    vehicleStore.put(vehicle);
  });
}

// Usage
async function bootstrapApplication() {
  // Assuming you've imported the parsed JSON
  import('./parsedVehicleData.json').then(async (data) => {
    await initializeDatabase(data);
    // Proceed with app initialization
  });
}
```