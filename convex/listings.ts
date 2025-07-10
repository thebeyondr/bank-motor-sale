import { query } from "./_generated/server";
import { v } from "convex/values";

export const get = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("listings"),
      _creationTime: v.number(),
      id: v.string(),
      vehicleId: v.string(),
      bankId: v.string(),
      price: v.union(v.null(), v.number()),
      amount: v.number(),
      color: v.union(v.null(), v.string()),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db.query("listings").collect();
  },
});

export const getListingsByVehicle = query({
  args: {
    vehicleId: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("listings"),
      _creationTime: v.number(),
      id: v.string(),
      vehicleId: v.string(),
      bankId: v.string(),
      price: v.union(v.null(), v.number()),
      amount: v.number(),
      color: v.union(v.null(), v.string()),
      bank: v.object({
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
      }),
    })
  ),
  handler: async (ctx, args) => {
    const listings = await ctx.db
      .query("listings")
      .withIndex("by_vehicleId", (q) => q.eq("vehicleId", args.vehicleId))
      .collect();

    const listingsWithBanks = await Promise.all(
      listings.map(async (listing) => {
        const banks = await ctx.db.query("banks").collect();
        const bank = banks.find((b) => b.id === listing.bankId);
        return {
          ...listing,
          bank: bank!,
        };
      })
    );

    return listingsWithBanks;
  },
});

export const getListingsByBank = query({
  args: {
    bankId: v.string(),
  },
  returns: v.array(
    v.object({
      _id: v.id("listings"),
      _creationTime: v.number(),
      id: v.string(),
      vehicleId: v.string(),
      bankId: v.string(),
      price: v.union(v.null(), v.number()),
      amount: v.number(),
      color: v.union(v.null(), v.string()),
      vehicle: v.object({
        _id: v.id("vehicles"),
        _creationTime: v.number(),
        id: v.string(),
        make: v.string(),
        model: v.string(),
        year: v.number(),
      }),
    })
  ),
  handler: async (ctx, args) => {
    const listings = await ctx.db
      .query("listings")
      .withIndex("by_bankId", (q) => q.eq("bankId", args.bankId))
      .collect();

    const listingsWithVehicles = await Promise.all(
      listings.map(async (listing) => {
        const vehicles = await ctx.db.query("vehicles").collect();
        const vehicle = vehicles.find((v) => v.id === listing.vehicleId);
        return {
          ...listing,
          vehicle: vehicle!,
        };
      })
    );

    return listingsWithVehicles;
  },
});
