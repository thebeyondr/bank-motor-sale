import pandas as pd
import json
import uuid

# Define bank mapping with UUIDs
BANKS = {
    "JMMB": "8fc8081e-32cf-4f27-90ec-8e440ea6dcd4",
    "NCB": "cf984f5d-4bf8-405d-93f4-c518e258f7fe",
    "CIBC": "33ff7536-112c-4a40-9b16-a60666ac7d4f"
}

# Function to generate JSON structure from CSV
def convert_csv_to_indexeddb_json(csv_path, output_json_path):
    # Load CSV file
    df = pd.read_csv(csv_path)

    # Dictionary for storing vehicles and prices
    vehicles = {}
    prices = {}

    # Process CSV data, aggregating duplicate vehicles per bank
    for _, row in df.iterrows():
        vehicle_key = f"{row['Year']}_{row['Make']}_{row['Model']}"
        
        # Generate vehicle UUID if not already stored
        if vehicle_key not in vehicles:
            vehicle_id = str(uuid.uuid4())
            vehicles[vehicle_key] = {
                "id": vehicle_id,
                "year": row["Year"],
                "make": row["Make"],
                "model": row["Model"],
            }
        else:
            vehicle_id = vehicles[vehicle_key]["id"]
        
        # Get bank ID and price details
        bank_id = BANKS.get(row["Bank"], None)
        if bank_id:
            price_key = f"{vehicle_id}_{bank_id}"

            if price_key in prices:
                # If the vehicle exists for the bank, increment the amount count
                prices[price_key]["amount"] += 1
            else:
                # Otherwise, create a new entry
                prices[price_key] = {
                    "id": str(uuid.uuid4()),  # Unique ID for price entry
                    "vehicleId": vehicle_id,
                    "bankId": bank_id,
                    "price": row["Price"] if row["Price"] > 0 else None,
                    "amount": 1,
                    "color": row["Color"] if isinstance(row["Color"], str) and row["Color"].lower() != "unknown" else None
                }

    # Convert vehicles from dictionary to list for JSON output
    vehicles_list = list(vehicles.values())
    prices_list = list(prices.values())

    # Final structured JSON
    indexeddb_json = {
        "vehicles": vehicles_list,
        "prices": prices_list
    }

    # Save JSON file
    with open(output_json_path, "w") as json_file:
        json.dump(indexeddb_json, json_file, indent=4)

    print(f"JSON file saved successfully: {output_json_path}")

# Run script with a CSV file (modify path as needed)
if __name__ == "__main__":
    csv_file = "repo-vehicles.csv"  # Replace with actual CSV file path
    output_json = "indexeddb_vehicle_data.json"
    convert_csv_to_indexeddb_json(csv_file, output_json)
