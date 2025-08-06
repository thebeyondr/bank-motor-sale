import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  countries: defineTable({
    name: v.string(),
    code: v.string(),
    currency: v.string(),
    slug: v.string(),
    isActive: v.boolean(),
  })
    .index("by_slug", ["slug"])
    .index("by_code", ["code"])
    .index("by_active", ["isActive"]),

  users: defineTable({
    email: v.string(),
    role: v.union(v.literal("bank-representative"), v.literal("admin")),
    bankId: v.optional(v.id("banks")),
    isActive: v.optional(v.boolean()),
  })
    .index("by_email", ["email"])
    .index("by_bank", ["bankId"])
    .index("by_role", ["role"])
    .index("by_active_bank", ["isActive", "bankId"]),

  banks: defineTable({
    name: v.string(),
    slug: v.string(),
    countryId: v.id("countries"),
    isActive: v.boolean(),

    // Contact information
    contactInfo: v.object({
      address: v.string(),
      primaryEmail: v.string(),
      primaryPhone: v.string(),
      website: v.optional(v.string()),
      additionalEmails: v.optional(v.array(v.string())),
      additionalPhones: v.optional(v.array(v.string())),
    }),

    // Business operations
    operatingHours: v.object({
      weekdays: v.string(),
      weekends: v.string(),
    }),

    // Authorization - specific emails allowed to access this bank
    allowedEmails: v.array(v.string()),
    logoStorageId: v.optional(v.id("_storage")),

    // Instructions - keep essential only
    bidInstructions: v.string(),
    viewInstructions: v.string(),
    saleTerms: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_active", ["isActive"])
    .index("by_country", ["countryId"])
    .index("by_country_active", ["countryId", "isActive"])
    .index("by_name", ["name"]),

  // Vehicle catalog - reference data for form consistency
  vehicles: defineTable({
    make: v.string(),
    model: v.string(),
    year: v.number(),
    slug: v.string(), // Unique identifier: "toyota-camry-2020"

    // Vehicle specifications
    fuelType: v.optional(v.string()),
    bodyType: v.optional(v.string()), // e.g., "Compact SUV", "Sedan", "Truck"
    driveTrain: v.optional(
      v.union(
        v.literal("FWD"),
        v.literal("RWD"),
        v.literal("AWD"),
        v.literal("4WD")
      )
    ),
    transmission: v.optional(v.string()), // e.g., "Auto", "6 speed", "Tiptronic"

    // Metadata
    isActive: v.boolean(), // Hide discontinued models
  })
    .index("by_slug", ["slug"])
    .index("by_make_model_year", ["make", "model", "year"])
    .index("by_make_year", ["make", "year"])
    .index("by_active_make", ["isActive", "make"])
    .index("by_year_desc", ["year"])
    .index("by_body_type", ["bodyType"])
    .index("by_drive_train", ["driveTrain"])
    .index("by_fuel_type", ["fuelType"]),

  // Actual vehicle listings
  listings: defineTable({
    vehicleId: v.id("vehicles"),
    bankId: v.id("banks"),

    // Vehicle specifics
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

    // Pricing
    price: v.optional(v.number()),
    currency: v.optional(v.string()),

    // Listing management
    status: v.union(
      v.literal("draft"),
      v.literal("active"),
      v.literal("sold"),
      v.literal("expired"),
      v.literal("removed")
    ),

    // Media
    coverImageId: v.optional(v.id("_storage")),
    imageIds: v.array(v.id("_storage")), // Use storage IDs

    // Metadata
    expiresAt: v.optional(v.number()), // Auto-expiration
  })
    .index("by_bank_status", ["bankId", "status"])
    .index("by_vehicle_bank", ["vehicleId", "bankId"])
    .index("by_status", ["status"])
    .index("by_price_range", ["price"]) // For price filtering
    .index("by_active_price", ["status", "price"]), // Active listings by price

  // Search and filtering optimization
  listingFilters: defineTable({
    listingId: v.id("listings"),
    make: v.string(),
    model: v.string(),
    year: v.number(),
    priceRange: v.string(), // "0-10000", "10000-20000", etc.
    mileageRange: v.optional(v.string()),
    color: v.optional(v.string()),
    condition: v.optional(v.string()),
    bodyType: v.optional(v.string()),
    driveTrain: v.optional(v.string()),
    transmission: v.optional(v.string()),
    fuelType: v.optional(v.string()),
    bankId: v.id("banks"),
    countryId: v.id("countries"), // For country-based filtering
    isActive: v.boolean(),
  })
    .index("by_country_active", ["countryId", "isActive"])
    .index("by_make_active", ["make", "isActive"])
    .index("by_price_range_active", ["priceRange", "isActive"])
    .index("by_country_make_active", ["countryId", "make", "isActive"])
    .index("by_bank_make_active", ["bankId", "make", "isActive"])
    .index("by_year_range_active", ["year", "isActive"])
    .index("by_condition_active", ["condition", "isActive"])
    .index("by_body_type_active", ["bodyType", "isActive"])
    .index("by_drive_train_active", ["driveTrain", "isActive"])
    .index("by_fuel_type_active", ["fuelType", "isActive"]),

  // Market statistics for vehicle pricing insights
  marketStats: defineTable({
    vehicleSlug: v.string(),
    countryId: v.id("countries"),
    sampleSize: v.number(),
    medianPrice: v.number(),
    lastUpdated: v.number(), // epoch ms
  })
    .index("by_vehicle_country", ["vehicleSlug", "countryId"])
    .index("by_country", ["countryId"])
    .index("by_last_updated", ["lastUpdated"]),
});
