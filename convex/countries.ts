import { query } from "./_generated/server";
import { v } from "convex/values";

export const getCountries = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("countries"),
      _creationTime: v.number(),
      name: v.string(),
      code: v.string(),
      currency: v.string(),
      slug: v.string(),
      isActive: v.boolean(),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db.query("countries").collect();
  },
});

export const getActiveCountries = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("countries"),
      _creationTime: v.number(),
      name: v.string(),
      code: v.string(),
      currency: v.string(),
      slug: v.string(),
      isActive: v.boolean(),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db
      .query("countries")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getCountryBySlug = query({
  args: {
    slug: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("countries"),
      _creationTime: v.number(),
      name: v.string(),
      code: v.string(),
      currency: v.string(),
      slug: v.string(),
      isActive: v.boolean(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("countries")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const getCountryMappings = query({
  args: {},
  returns: v.object({
    countryNames: v.record(v.string(), v.string()),
    countryIds: v.record(v.string(), v.string()),
    countryCodes: v.record(v.string(), v.string()),
  }),
  handler: async (ctx) => {
    const countries = await ctx.db.query("countries").collect();

    const countryNames: Record<string, string> = {};
    const countryIds: Record<string, string> = {};
    const countryCodes: Record<string, string> = {};

    for (const country of countries) {
      countryNames[country._id] = country.name;
      countryIds[country.slug] = country._id;
      countryCodes[country._id] = country.code;
    }

    return { countryNames, countryIds, countryCodes };
  },
});
