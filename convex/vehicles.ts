import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("vehicles"),
      _creationTime: v.number(),
      make: v.string(),
      model: v.string(),
      year: v.number(),
      slug: v.string(),
      fuelType: v.optional(v.string()),
      bodyType: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db.query("vehicles").collect();
  },
});

export const getVehicles = query({
  args: {
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("vehicles"),
      _creationTime: v.number(),
      make: v.string(),
      model: v.string(),
      year: v.number(),
      slug: v.string(),
      fuelType: v.optional(v.string()),
      bodyType: v.optional(v.string()),
      listingCount: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let vehicles;

    if (args.make) {
      vehicles = await ctx.db
        .query("vehicles")
        .withIndex("by_make", (q) => q.eq("make", args.make!))
        .collect();
    } else {
      vehicles = await ctx.db.query("vehicles").collect();
    }

    let filteredVehicles = vehicles;
    if (args.model) {
      filteredVehicles = filteredVehicles.filter((v) => v.model === args.model);
    }
    if (args.year) {
      filteredVehicles = filteredVehicles.filter((v) => v.year === args.year);
    }

    // Get listing counts for each vehicle
    const vehiclesWithCounts = await Promise.all(
      filteredVehicles.map(async (vehicle) => {
        const listings = await ctx.db
          .query("listings")
          .withIndex("by_vehicleId", (q) => q.eq("vehicleId", vehicle._id))
          .collect();

        return {
          ...vehicle,
          listingCount: listings.length,
        };
      })
    );

    return vehiclesWithCounts;
  },
});

export const getVehicleById = query({
  args: {
    id: v.id("vehicles"),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("vehicles"),
      _creationTime: v.number(),
      make: v.string(),
      model: v.string(),
      year: v.number(),
      slug: v.string(),
      fuelType: v.optional(v.string()),
      bodyType: v.optional(v.string()),
      listings: v.array(
        v.object({
          _id: v.id("listings"),
          _creationTime: v.number(),
          vehicleId: v.id("vehicles"),
          bankId: v.id("banks"),
          mileage: v.optional(v.number()),
          color: v.optional(v.string()),
          condition: v.optional(
            v.union(
              v.literal("Excellent"),
              v.literal("Good"),
              v.literal("Fair"),
              v.literal("Unknown"),
              v.null()
            )
          ),
          price: v.union(v.number(), v.null()),
          images: v.array(
            v.object({
              url: v.string(),
              isCover: v.boolean(),
              rank: v.optional(v.number()),
            })
          ),
          createdAt: v.number(),
          bank: v.object({
            _id: v.id("banks"),
            _creationTime: v.number(),
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
    const vehicle = await ctx.db.get(args.id);
    if (!vehicle) return null;

    const listings = await ctx.db
      .query("listings")
      .withIndex("by_vehicleId", (q) => q.eq("vehicleId", args.id))
      .collect();

    const listingsWithBanks = await Promise.all(
      listings.map(async (listing) => {
        const bank = await ctx.db.get(listing.bankId);
        const { allowedEmails, ...safeBank } = bank!;
        return {
          ...listing,
          bank: safeBank,
        };
      })
    );

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
    fuelTypes: v.array(v.string()),
    bodyTypes: v.array(v.string()),
  }),
  handler: async (ctx) => {
    const vehicles = await ctx.db.query("vehicles").collect();

    const makes = [...new Set(vehicles.map((v) => v.make))].sort();
    const models = [...new Set(vehicles.map((v) => v.model))].sort();
    const years = [...new Set(vehicles.map((v) => v.year))].sort(
      (a, b) => b - a
    );
    const fuelTypes = [
      ...new Set(
        vehicles
          .map((v) => v.fuelType)
          .filter((f): f is string => f !== undefined)
      ),
    ].sort();
    const bodyTypes = [
      ...new Set(
        vehicles
          .map((v) => v.bodyType)
          .filter((b): b is string => b !== undefined)
      ),
    ].sort();

    return {
      makes,
      models,
      years,
      fuelTypes,
      bodyTypes,
    };
  },
});

export const createVehicle = mutation({
  args: {
    make: v.string(),
    model: v.string(),
    year: v.number(),
    fuelType: v.optional(v.string()),
    bodyType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate slug
    const slug = `${
      args.year
    }-${args.make.toLowerCase()}-${args.model.toLowerCase()}`.replace(
      /\s+/g,
      "-"
    );

    // Check if this vehicle already exists
    const existing = await ctx.db
      .query("vehicles")
      .withIndex("by_make_model_year", (q) =>
        q.eq("make", args.make).eq("model", args.model).eq("year", args.year)
      )
      .first();

    if (existing) {
      throw new Error("Vehicle already exists in catalog");
    }

    // Validate year
    const currentYear = new Date().getFullYear();
    if (args.year < 1990 || args.year > currentYear) {
      throw new Error(`Year must be between 1990 and ${currentYear}`);
    }

    const vehicleId = await ctx.db.insert("vehicles", {
      make: args.make,
      model: args.model,
      year: args.year,
      slug,
      fuelType: args.fuelType,
      bodyType: args.bodyType,
    });

    return vehicleId;
  },
});
