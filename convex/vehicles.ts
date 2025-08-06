import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const toggleVehicleStatus = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    await ctx.db.patch(args.vehicleId, {
      isActive: args.isActive,
    });

    return args.vehicleId;
  },
});

export const getAllVehicles = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("vehicles"),
      _creationTime: v.number(),
      make: v.string(),
      model: v.string(),
      year: v.number(),
      slug: v.string(),
      isActive: v.boolean(),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db.query("vehicles").collect();
  },
});

export const getActiveVehicles = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("vehicles"),
      _creationTime: v.number(),
      make: v.string(),
      model: v.string(),
      year: v.number(),
      slug: v.string(),
      isActive: v.boolean(),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db
      .query("vehicles")
      .withIndex("by_active_make", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getVehicles = query({
  args: {
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    activeOnly: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      _id: v.id("vehicles"),
      _creationTime: v.number(),
      make: v.string(),
      model: v.string(),
      year: v.number(),
      slug: v.string(),
      isActive: v.boolean(),
      listingCount: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let vehicles;

    // Filter by active status if specified
    if (args.activeOnly) {
      if (args.make) {
        vehicles = await ctx.db
          .query("vehicles")
          .withIndex("by_active_make", (q) =>
            q.eq("isActive", true).eq("make", args.make!)
          )
          .collect();
      } else {
        vehicles = await ctx.db
          .query("vehicles")
          .withIndex("by_active_make", (q) => q.eq("isActive", true))
          .collect();
      }
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

    // Get listing counts for each vehicle (only count active listings)
    const vehiclesWithCounts = await Promise.all(
      filteredVehicles.map(async (vehicle) => {
        const listings = await ctx.db
          .query("listings")
          .withIndex("by_vehicle_bank", (q) => q.eq("vehicleId", vehicle._id))
          .collect();

        // Count only active listings
        const activeListings = listings.filter((l) => l.status === "active");

        return {
          ...vehicle,
          listingCount: activeListings.length,
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
      isActive: v.boolean(),
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
              v.literal("like new"),
              v.literal("well maintained"),
              v.literal("fair condition"),
              v.literal("poorly maintained"),
              v.literal("needs work"),
              v.literal("unknown")
            )
          ),
          price: v.optional(v.number()),
          currency: v.optional(v.string()),
          status: v.union(
            v.literal("draft"),
            v.literal("active"),
            v.literal("sold"),
            v.literal("expired"),
            v.literal("removed")
          ),
          coverImageId: v.optional(v.id("_storage")),
          imageIds: v.array(v.id("_storage")),
          coverImageUrl: v.union(v.string(), v.null()),
          imageUrls: v.array(v.string()),
          expiresAt: v.optional(v.number()),
          bank: v.object({
            _id: v.id("banks"),
            _creationTime: v.number(),
            name: v.string(),
            slug: v.string(),
            countryId: v.id("countries"),
            isActive: v.boolean(),
            bidInstructions: v.string(),
            contactInfo: v.object({
              address: v.string(),
              primaryEmail: v.string(),
              primaryPhone: v.string(),
              website: v.optional(v.string()),
              additionalEmails: v.optional(v.array(v.string())),
              additionalPhones: v.optional(v.array(v.string())),
            }),
            operatingHours: v.object({
              weekdays: v.string(),
              weekends: v.string(),
            }),
            saleTerms: v.string(),
            viewInstructions: v.string(),
            logoStorageId: v.optional(v.id("_storage")),
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
      .withIndex("by_vehicle_bank", (q) => q.eq("vehicleId", args.id))
      .collect();

    const listingsWithBanks = await Promise.all(
      listings.map(async (listing) => {
        const bank = await ctx.db.get(listing.bankId);

        // Convert storage IDs to URLs
        const coverImageUrl = listing.coverImageId
          ? await ctx.storage.getUrl(listing.coverImageId)
          : null;

        const imageUrls = await Promise.all(
          listing.imageIds.map(async (imageId) => {
            const url = await ctx.storage.getUrl(imageId);
            return url || "";
          })
        );

        const { allowedEmails, ...safeBank } = bank!;
        return {
          ...listing,
          coverImageUrl,
          imageUrls: imageUrls.filter((url) => url),
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
  args: {
    activeOnly: v.optional(v.boolean()),
  },
  returns: v.object({
    makes: v.array(v.string()),
    models: v.array(v.string()),
    years: v.array(v.number()),
  }),
  handler: async (ctx, args) => {
    let vehicles;

    if (args.activeOnly) {
      vehicles = await ctx.db
        .query("vehicles")
        .withIndex("by_active_make", (q) => q.eq("isActive", true))
        .collect();
    } else {
      vehicles = await ctx.db.query("vehicles").collect();
    }

    const makes = [...new Set(vehicles.map((v) => v.make))].sort();
    const models = [...new Set(vehicles.map((v) => v.model))].sort();
    const years = [...new Set(vehicles.map((v) => v.year))].sort(
      (a, b) => b - a
    );

    return {
      makes,
      models,
      years,
    };
  },
});

export const createVehicle = mutation({
  args: {
    make: v.string(),
    model: v.string(),
    year: v.number(),
  },
  handler: async (ctx, args) => {
    // Generate slug
    const slug = `${args.make.toLowerCase()}-${args.model.toLowerCase()}-${
      args.year
    }`.replace(/\s+/g, "-");

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
    if (args.year < 1990 || args.year > currentYear + 1) {
      throw new Error(`Year must be between 1990 and ${currentYear + 1}`);
    }

    const now = Date.now();
    const vehicleId = await ctx.db.insert("vehicles", {
      make: args.make,
      model: args.model,
      year: args.year,
      slug,
      isActive: true,
    });

    return vehicleId;
  },
});
