import { internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

// Helper function to determine price range
function getPriceRange(price?: number): string {
  if (!price || price === 0) return "0";
  if (price <= 500000) return "0-500000";
  if (price <= 1000000) return "500000-1000000";  
  if (price <= 2000000) return "1000000-2000000";
  if (price <= 3000000) return "2000000-3000000";
  if (price <= 5000000) return "3000000-5000000";
  return "5000000+";
}

// Helper function to determine mileage range  
function getMileageRange(mileage?: number): string {
  if (!mileage || mileage === 0) return "0";
  if (mileage <= 50000) return "0-50000";
  if (mileage <= 100000) return "50000-100000";
  if (mileage <= 150000) return "100000-150000";
  if (mileage <= 200000) return "150000-200000";
  return "200000+";
}

// Migrate existing listings to listingFilters table
export const populateListingFilters = internalMutation({
  handler: async (ctx) => {
    // Get all listings
    const listings = await ctx.db.query("listings").collect();
    
    console.log(`Found ${listings.length} listings to migrate`);
    
    let migratedCount = 0;
    
    for (const listing of listings) {
      try {
        // Get related data
        const vehicle = await ctx.db.get(listing.vehicleId);
        const bank = await ctx.db.get(listing.bankId);
        const country = bank ? await ctx.db.get(bank.countryId) : null;

        if (!vehicle || !bank || !country) {
          console.log(`Skipping listing ${listing._id} - missing related data`);
          continue;
        }

        // Check if filter record already exists
        const existingFilter = await ctx.db
          .query("listingFilters")
          .filter((q) => q.eq(q.field("listingId"), listing._id))
          .first();

        if (existingFilter) {
          console.log(`Filter already exists for listing ${listing._id}`);
          continue;
        }

        // Create filter record
        const filterData = {
          listingId: listing._id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          priceRange: getPriceRange(listing.price),
          mileageRange: getMileageRange(listing.mileage),
          color: listing.color,
          condition: listing.condition,
          bodyType: vehicle.bodyType,
          driveTrain: vehicle.driveTrain,
          transmission: vehicle.transmission,
          fuelType: vehicle.fuelType,
          bankId: listing.bankId,
          countryId: country._id,
          isActive: listing.status === "active",
        };

        await ctx.db.insert("listingFilters", filterData);
        migratedCount++;
        
      } catch (error) {
        console.error(`Error migrating listing ${listing._id}:`, error);
      }
    }
    
    console.log(`Successfully migrated ${migratedCount} listings to listingFilters`);
    return migratedCount;
  },
});