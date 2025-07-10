import { query } from "./_generated/server";
import { v } from "convex/values";

export const getBanks = query({
  args: {},
  returns: v.array(
    v.object({
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
    })
  ),
  handler: async (ctx) => {
    return await ctx.db.query("banks").collect();
  },
});

export const getBankById = query({
  args: {
    id: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({
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
    })
  ),
  handler: async (ctx, args) => {
    const banks = await ctx.db.query("banks").collect();
    return banks.find((bank) => bank.id === args.id) || null;
  },
});
