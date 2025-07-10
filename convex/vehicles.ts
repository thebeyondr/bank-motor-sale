import { query } from "./_generated/server";
import { v } from "convex/values";

export const getVehicles = query({
  args: {
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    bankId: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("vehicles"),
      _creationTime: v.number(),
      id: v.string(),
      make: v.string(),
      model: v.string(),
      year: v.number(),
      listings: v.array(
        v.object({
          _id: v.id("listings"),
          _creationTime: v.number(),
          id: v.string(),
          vehicleId: v.string(),
          bankId: v.string(),
          price: v.union(v.null(), v.number()),
          amount: v.number(),
          color: v.union(v.null(), v.string()),
          bank: v.object({
            _id: v.id("banks"),
            _creationTime: v.number(),
            id: v.string(),
            name: v.string(),
            bidInstructions: v.string(),
            contactInfo: v.object({
              address: v.string(),
              emails: v.array(v.string()),
              phones: v.array(v.string()),
              website: v.string(),
            }),
            operatingHours: v.object({
              weekdays: v.string(),
              weekends: v.string(),
            }),
            saleTerms: v.string(),
            viewInstructions: v.string(),
          }),
        })
      ),
    })
  ),
  handler: async (ctx, args) => {
    // Start with all vehicles
    let vehicles = await ctx.db.query("vehicles").collect();

    // Apply vehicle filters
    if (args.make) {
      vehicles = vehicles.filter((v) => v.make === args.make);
    }
    if (args.model) {
      vehicles = vehicles.filter((v) => v.model === args.model);
    }
    if (args.year) {
      vehicles = vehicles.filter((v) => v.year === args.year);
    }

    // Get listings for each vehicle and apply additional filters
    const results = [];
    for (const vehicle of vehicles) {
      const listings = await ctx.db
        .query("listings")
        .withIndex("by_vehicleId", (q) => q.eq("vehicleId", vehicle.id))
        .collect();

      // Apply listing filters
      let filteredListings = listings;
      if (args.bankId) {
        filteredListings = filteredListings.filter(
          (listing) => listing.bankId === args.bankId
        );
      }
      if (args.color) {
        filteredListings = filteredListings.filter(
          (listing) =>
            listing.color?.toLowerCase() === args.color?.toLowerCase()
        );
      }
      if (args.minPrice) {
        filteredListings = filteredListings.filter(
          (listing) => listing.price && listing.price >= args.minPrice!
        );
      }
      if (args.maxPrice) {
        filteredListings = filteredListings.filter(
          (listing) => listing.price && listing.price <= args.maxPrice!
        );
      }

      // Skip vehicle if no listings match filters
      if (filteredListings.length === 0) continue;

      // Get bank info for each listing
      const banks = await ctx.db.query("banks").collect();
      const listingsWithBanks = filteredListings.map((listing) => {
        const bank = banks.find((b) => b.id === listing.bankId);
        return {
          ...listing,
          bank: bank!,
        };
      });

      results.push({
        ...vehicle,
        listings: listingsWithBanks,
      });
    }

    return results;
  },
});

export const getVehicleById = query({
  args: {
    id: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("vehicles"),
      _creationTime: v.number(),
      id: v.string(),
      make: v.string(),
      model: v.string(),
      year: v.number(),
      listings: v.array(
        v.object({
          _id: v.id("listings"),
          _creationTime: v.number(),
          id: v.string(),
          vehicleId: v.string(),
          bankId: v.string(),
          price: v.union(v.null(), v.number()),
          amount: v.number(),
          color: v.union(v.null(), v.string()),
          bank: v.object({
            _id: v.id("banks"),
            _creationTime: v.number(),
            id: v.string(),
            name: v.string(),
            bidInstructions: v.string(),
            contactInfo: v.object({
              address: v.string(),
              emails: v.array(v.string()),
              phones: v.array(v.string()),
              website: v.string(),
            }),
            operatingHours: v.object({
              weekdays: v.string(),
              weekends: v.string(),
            }),
            saleTerms: v.string(),
            viewInstructions: v.string(),
          }),
        })
      ),
    })
  ),
  handler: async (ctx, args) => {
    // Find vehicle by custom id field
    const vehicles = await ctx.db.query("vehicles").collect();
    const vehicle = vehicles.find((v) => v.id === args.id);

    if (!vehicle) return null;

    const listings = await ctx.db
      .query("listings")
      .withIndex("by_vehicleId", (q) => q.eq("vehicleId", args.id))
      .collect();

    const banks = await ctx.db.query("banks").collect();
    const listingsWithBanks = listings.map((listing) => {
      const bank = banks.find((b) => b.id === listing.bankId);
      return {
        ...listing,
        bank: bank!,
      };
    });

    return {
      ...vehicle,
      listings: listingsWithBanks,
    };
  },
});

export const getVehicleFilters = query({
  args: {},
  returns: v.object({
    makes: v.array(v.string()),
    models: v.array(v.string()),
    years: v.array(v.number()),
    colors: v.array(v.string()),
    banks: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
      })
    ),
  }),
  handler: async (ctx) => {
    // Get all vehicles for filter options
    const vehicles = await ctx.db.query("vehicles").collect();
    const listings = await ctx.db.query("listings").collect();
    const banks = await ctx.db.query("banks").collect();

    // Extract unique values
    const makes = [...new Set(vehicles.map((v) => v.make))].sort();
    const models = [...new Set(vehicles.map((v) => v.model))].sort();
    const years = [...new Set(vehicles.map((v) => v.year))].sort(
      (a, b) => b - a
    );
    const colors = [
      ...new Set(
        listings.map((l) => l.color).filter((c): c is string => c !== null)
      ),
    ].sort();

    const bankOptions = banks.map((bank) => ({
      id: bank.id,
      name: bank.name,
    }));

    return {
      makes,
      models,
      years,
      colors,
      banks: bankOptions,
    };
  },
});
