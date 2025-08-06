import type { Id } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const updateMarketStats = mutation({
  args: {
    vehicleSlug: v.string(),
    countryId: v.id("countries"),
  },
  handler: async (ctx, args) => {
    // Get all active listings for this vehicle slug and country
    const listings = await ctx.db.query("listings").collect();

    // Get vehicle details to filter by slug
    const vehicles = await ctx.db.query("vehicles").collect();
    const targetVehicle = vehicles.find((v) => v.slug === args.vehicleSlug);

    if (!targetVehicle) {
      throw new Error("Vehicle not found");
    }

    // Get banks in this country
    const banks = await ctx.db.query("banks").collect();
    const countryBanks = banks.filter((b) => b.countryId === args.countryId);
    const countryBankIds = countryBanks.map((b) => b._id);

    // Filter listings by vehicle, country (via bank), and active status
    const relevantListings = listings.filter(
      (listing) =>
        listing.vehicleId === targetVehicle._id &&
        countryBankIds.includes(listing.bankId) &&
        listing.status === "active" &&
        listing.price !== undefined
    );

    // Calculate median price
    const prices = relevantListings.map((l) => l.price!).sort((a, b) => a - b);
    const sampleSize = prices.length;

    let medianPrice = 0;
    if (sampleSize > 0) {
      if (sampleSize % 2 === 0) {
        medianPrice = (prices[sampleSize / 2 - 1] + prices[sampleSize / 2]) / 2;
      } else {
        medianPrice = prices[Math.floor(sampleSize / 2)];
      }
    }

    // Upsert the market stats
    const existing = await ctx.db
      .query("marketStats")
      .withIndex("by_vehicle_country", (q) =>
        q.eq("vehicleSlug", args.vehicleSlug).eq("countryId", args.countryId)
      )
      .first();

    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, {
        sampleSize,
        medianPrice,
        lastUpdated: now,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("marketStats", {
        vehicleSlug: args.vehicleSlug,
        countryId: args.countryId,
        sampleSize,
        medianPrice,
        lastUpdated: now,
      });
    }
  },
});

export const getMarketStats = query({
  args: {
    vehicleSlug: v.string(),
    countryId: v.id("countries"),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("marketStats"),
      _creationTime: v.number(),
      vehicleSlug: v.string(),
      countryId: v.id("countries"),
      sampleSize: v.number(),
      medianPrice: v.number(),
      lastUpdated: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("marketStats")
      .withIndex("by_vehicle_country", (q) =>
        q.eq("vehicleSlug", args.vehicleSlug).eq("countryId", args.countryId)
      )
      .first();
  },
});
