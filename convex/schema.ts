import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  banks: defineTable({
    bidInstructions: v.string(),
    contactInfo: v.object({
      address: v.string(),
      emails: v.array(v.string()),
      phones: v.array(v.string()),
      website: v.string(),
    }),
    id: v.string(),
    name: v.string(),
    operatingHours: v.object({
      weekdays: v.string(),
      weekends: v.string(),
    }),
    saleTerms: v.string(),
    viewInstructions: v.string(),
  }),
  listings: defineTable({
    amount: v.float64(),
    bankId: v.string(),
    color: v.union(v.null(), v.string()),
    id: v.string(),
    price: v.union(v.null(), v.float64()),
    vehicleId: v.string(),
  })
    .index("by_vehicleId", ["vehicleId"])
    .index("by_bankId", ["bankId"])
    .index("by_color", ["color"])
    .index("by_price", ["price"])
    .index("by_vehicleId_bankId", ["vehicleId", "bankId"]),
  vehicles: defineTable({
    id: v.string(),
    make: v.string(),
    model: v.string(),
    year: v.float64(),
  })
    .index("by_make", ["make"])
    .index("by_model", ["model"])
    .index("by_year", ["year"])
    .index("by_make_model", ["make", "model"])
    .index("by_make_year", ["make", "year"]),
});
