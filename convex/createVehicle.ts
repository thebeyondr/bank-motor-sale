import { Id } from "./_generated/dataModel";
import { mutation } from "./_generated/server";
import { v } from "convex/values";

// This function creates a listing for an existing vehicle in the catalog
// The vehicle must already exist in the vehicles table (controlled catalog)
export const createListing = mutation({
  args: {
    vehicleId: v.id("vehicles"),
    mileage: v.optional(v.number()),
    color: v.optional(v.string()),
    condition: v.optional(
      v.union(
        v.literal("Excellent"),
        v.literal("Good"),
        v.literal("Fair"),
        v.literal("Unknown")
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
  },
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    // Find the bank associated with the authenticated user
    const banks = await ctx.db.query("banks").collect();
    const bank = banks.find((b) =>
      b.contactInfo.emails.includes(identity.email || "")
    );

    if (!bank) {
      throw new Error("Bank not found for authenticated user");
    }

    // Verify vehicle exists in catalog
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) {
      throw new Error("Vehicle not found in catalog");
    }

    // Validate images
    if (args.images.length < 1) {
      throw new Error("At least one image is required");
    }

    const coverImages = args.images.filter((img) => img.isCover);
    if (coverImages.length !== 1) {
      throw new Error("Exactly one image must be marked as cover");
    }

    // Validate price if present
    if (args.price !== null && args.price <= 0) {
      throw new Error("Price must be greater than 0");
    }

    // Validate mileage if present
    if (args.mileage !== undefined && args.mileage < 0) {
      throw new Error("Mileage cannot be negative");
    }

    // Create the listing
    const listingId = await ctx.db.insert("listings", {
      vehicleId: args.vehicleId,
      bankId: bank._id,
      mileage: args.mileage,
      color: args.color,
      condition: args.condition,
      price: args.price,
      images: args.images,
      createdAt: Date.now(),
    });

    return listingId;
  },
});

// This function adds a new vehicle type to the controlled catalog
// Only for adding new make/model/year combinations that don't exist yet
export const addVehicleToCatalog = mutation({
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

// Convenience function to create both vehicle and listing in one go
// Use this when a bank wants to list a vehicle that doesn't exist in the catalog yet
export const createVehicleAndListing = mutation({
  args: {
    // Vehicle catalog info
    make: v.string(),
    model: v.string(),
    year: v.number(),
    fuelType: v.optional(v.string()),
    bodyType: v.optional(v.string()),
    // Listing-specific info
    mileage: v.optional(v.number()),
    color: v.optional(v.string()),
    condition: v.optional(
      v.union(
        v.literal("Excellent"),
        v.literal("Good"),
        v.literal("Fair"),
        v.literal("Unknown")
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
  },
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    // Find the bank associated with the authenticated user
    const banks = await ctx.db.query("banks").collect();
    const bank = banks.find((b) =>
      b.contactInfo.emails.includes(identity.email || "")
    );

    if (!bank) {
      throw new Error("Bank not found for authenticated user");
    }

    // Check if vehicle already exists in catalog
    let vehicleId: Id<"vehicles">;
    const existingVehicle = await ctx.db
      .query("vehicles")
      .withIndex("by_make_model_year", (q) =>
        q.eq("make", args.make).eq("model", args.model).eq("year", args.year)
      )
      .first();

    if (existingVehicle) {
      vehicleId = existingVehicle._id;
    } else {
      // Create new vehicle in catalog
      const slug = `${
        args.year
      }-${args.make.toLowerCase()}-${args.model.toLowerCase()}`.replace(
        /\s+/g,
        "-"
      );

      // Validate year
      const currentYear = new Date().getFullYear();
      if (args.year < 1990 || args.year > currentYear) {
        throw new Error(`Year must be between 1990 and ${currentYear}`);
      }

      vehicleId = await ctx.db.insert("vehicles", {
        make: args.make,
        model: args.model,
        year: args.year,
        slug,
        fuelType: args.fuelType,
        bodyType: args.bodyType,
      });
    }

    // Validate listing data
    if (args.images.length < 1) {
      throw new Error("At least one image is required");
    }

    const coverImages = args.images.filter((img) => img.isCover);
    if (coverImages.length !== 1) {
      throw new Error("Exactly one image must be marked as cover");
    }

    if (args.price !== null && args.price <= 0) {
      throw new Error("Price must be greater than 0");
    }

    if (args.mileage !== undefined && args.mileage < 0) {
      throw new Error("Mileage cannot be negative");
    }

    // Create the listing
    const listingId = await ctx.db.insert("listings", {
      vehicleId,
      bankId: bank._id,
      mileage: args.mileage,
      color: args.color,
      condition: args.condition,
      price: args.price,
      images: args.images,
      createdAt: Date.now(),
    });

    return { vehicleId, listingId };
  },
});
