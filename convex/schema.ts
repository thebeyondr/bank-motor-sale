import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    bank: v.id("banks"),
  }),
  banks: defineTable({
    bidInstructions: v.string(),
    contactInfo: v.object({
      address: v.string(),
      emails: v.array(v.string()),
      phones: v.array(v.string()),
      website: v.string(),
    }),
    name: v.string(),
    operatingHours: v.object({
      weekdays: v.string(),
      weekends: v.string(),
    }),
    saleTerms: v.string(),
    viewInstructions: v.string(),
    allowedEmails: v.array(v.string()),
  }),
  vehicles: defineTable({
    make: v.string(),
    model: v.string(),
    year: v.number(),
    slug: v.string(),
    fuelType: v.optional(v.string()),
    bodyType: v.optional(v.string()),
  })
    .index("by_make", ["make"])
    .index("by_model", ["model"])
    .index("by_year", ["year"])
    .index("by_slug", ["slug"])
    .index("by_make_model", ["make", "model"])
    .index("by_make_year", ["make", "year"])
    .index("by_make_model_year", ["make", "model", "year"]),
  listings: defineTable({
    vehicleId: v.id("vehicles"),
    bankId: v.id("banks"),
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
    createdAt: v.number(),
  })
    .index("by_vehicleId", ["vehicleId"])
    .index("by_bankId", ["bankId"])
    .index("by_color", ["color"])
    .index("by_price", ["price"])
    .index("by_condition", ["condition"])
    .index("by_createdAt", ["createdAt"])
    .index("by_vehicleId_bankId", ["vehicleId", "bankId"]),
});
