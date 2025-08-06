import { query } from "./_generated/server";
import { v } from "convex/values";

export const getBanksByCountry = query({
  args: {
    countryId: v.id("countries"),
  },
  returns: v.array(
    v.object({
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
    })
  ),
  handler: async (ctx, args) => {
    const banks = await ctx.db
      .query("banks")
      .withIndex("by_country_active", (q) =>
        q.eq("countryId", args.countryId).eq("isActive", true)
      )
      .collect();
    return banks.map(({ allowedEmails, ...bank }) => bank);
  },
});

export const getBanks = query({
  args: {},
  returns: v.array(
    v.object({
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
    })
  ),
  handler: async (ctx) => {
    const banks = await ctx.db.query("banks").collect();
    return banks.map(({ allowedEmails, ...bank }) => bank);
  },
});

export const getBankMappings = query({
  args: {},
  returns: v.object({
    bankNames: v.record(v.string(), v.string()),
    bankIds: v.record(v.string(), v.string()),
  }),
  handler: async (ctx) => {
    const banks = await ctx.db.query("banks").collect();

    const bankNames: Record<string, string> = {};
    const bankIds: Record<string, string> = {};

    for (const bank of banks) {
      bankNames[bank._id] = bank.name;
      bankIds[bank.name] = bank._id;
    }

    return { bankNames, bankIds };
  },
});

export const getBankById = query({
  args: {
    id: v.id("banks"),
  },
  returns: v.union(
    v.null(),
    v.object({
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
    })
  ),
  handler: async (ctx, args) => {
    const bank = await ctx.db.get(args.id);
    if (!bank) return null;
    const { allowedEmails, ...safeBank } = bank;
    return safeBank;
  },
});
