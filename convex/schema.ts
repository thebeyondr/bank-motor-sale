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
  }),
  vehicles: defineTable({
    id: v.string(),
    make: v.string(),
    model: v.string(),
    year: v.float64(),
  }),
});
