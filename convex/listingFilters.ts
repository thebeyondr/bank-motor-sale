import type { Id } from "./_generated/dataModel";
import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

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

// Create or update listingFilter record
export const upsertListingFilter = internalMutation({
  args: {
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    // Get the listing
    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    // Get related data
    const vehicle = await ctx.db.get(listing.vehicleId);
    const bank = await ctx.db.get(listing.bankId);
    const country = bank ? await ctx.db.get(bank.countryId) : null;

    if (!vehicle || !bank || !country) {
      throw new Error("Required related data not found");
    }

    // Check if filter record already exists
    const existingFilter = await ctx.db
      .query("listingFilters")
      .filter((q) => q.eq(q.field("listingId"), args.listingId))
      .first();

    const filterData = {
      listingId: args.listingId,
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

    if (existingFilter) {
      // Update existing record
      await ctx.db.patch(existingFilter._id, filterData);
      return existingFilter._id;
    } else {
      // Create new record
      return await ctx.db.insert("listingFilters", filterData);
    }
  },
});

// Remove listingFilter record when listing is deleted
export const removeListingFilter = internalMutation({
  args: {
    listingId: v.id("listings"),
  },
  handler: async (ctx, args) => {
    const existingFilter = await ctx.db
      .query("listingFilters")
      .filter((q) => q.eq(q.field("listingId"), args.listingId))
      .first();

    if (existingFilter) {
      await ctx.db.delete(existingFilter._id);
    }
  },
});

// High-performance filtered listings query - simplified version
export const getFilteredListingsSimple = query({
  args: {
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    color: v.optional(v.string()),
    condition: v.optional(v.string()),
    countryId: v.optional(v.id("countries")),
    bankId: v.optional(v.id("banks")),
  },
  returns: v.array(v.id("listings")),
  handler: async (ctx, args) => {
    // Start with active filters only
    let filters: any[] = await ctx.db
      .query("listingFilters") 
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Apply filters
    if (args.make) {
      filters = filters.filter((f) => f.make === args.make);
    }
    if (args.model) {
      filters = filters.filter((f) => f.model === args.model);
    }
    if (args.year) {
      filters = filters.filter((f) => f.year === args.year);
    }
    if (args.color) {
      filters = filters.filter((f) => f.color === args.color);
    }
    if (args.condition) {
      filters = filters.filter((f) => f.condition === args.condition);
    }
    if (args.countryId) {
      filters = filters.filter((f) => f.countryId === args.countryId);
    }
    if (args.bankId) {
      filters = filters.filter((f) => f.bankId === args.bankId);
    }

    // Apply price filtering by getting the actual listings
    let listingIds = filters.map((f) => f.listingId);
    
    if (args.minPrice || args.maxPrice) {
      const validListingIds: any[] = [];
      
      for (const id of listingIds) {
        const listing = await ctx.db.get(id);
        if (!listing || listing._id === undefined) continue;
        
        // Type assertion since we know this is a listing
        const listingData = listing as any;
        
        if (args.minPrice && listingData.price && listingData.price < args.minPrice) {
          continue;
        }
        if (args.maxPrice && listingData.price && listingData.price > args.maxPrice) {
          continue;
        }
        
        validListingIds.push(id);
      }
      
      listingIds = validListingIds;
    }

    return listingIds;
  },
});

// Get available filter options for dynamic UI
export const getFilterOptions = query({
  args: {
    countryId: v.optional(v.id("countries")),
  },
  returns: v.object({
    makes: v.array(v.string()),
    models: v.array(v.string()),
    years: v.array(v.number()),
    colors: v.array(v.string()),
    conditions: v.array(v.string()),
    bodyTypes: v.array(v.string()),
    driveTrains: v.array(v.string()),
    fuelTypes: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    // Get active listings only
    let filters: any[] = await ctx.db
      .query("listingFilters")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Filter by country if specified
    if (args.countryId) {
      filters = filters.filter((f) => f.countryId === args.countryId);
    }

    // Extract unique values for each filter type
    const makes = [...new Set(filters.map((f) => f.make))].sort();
    const models = [...new Set(filters.map((f) => f.model))].sort();
    const years = [...new Set(filters.map((f) => f.year))].sort((a, b) => b - a);
    const colors = [...new Set(filters.map((f) => f.color).filter(Boolean))].sort() as string[];
    const conditions = [...new Set(filters.map((f) => f.condition).filter(Boolean))].sort() as string[];
    const bodyTypes = [...new Set(filters.map((f) => f.bodyType).filter(Boolean))].sort() as string[];
    const driveTrains = [...new Set(filters.map((f) => f.driveTrain).filter(Boolean))].sort() as string[];
    const fuelTypes = [...new Set(filters.map((f) => f.fuelType).filter(Boolean))].sort() as string[];

    return {
      makes,
      models,
      years,
      colors,
      conditions,
      bodyTypes,
      driveTrains,
      fuelTypes,
    };
  },
});