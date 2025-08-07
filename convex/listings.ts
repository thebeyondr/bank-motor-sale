import type { Id } from "./_generated/dataModel";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

export const get = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("listings"),
      _creationTime: v.number(),
      vehicleId: v.id("vehicles"),
      bankId: v.id("banks"),
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
      price: v.optional(v.number()),
      currency: v.optional(v.string()),
      status: v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("sold"),
        v.literal("expired"),
        v.literal("removed")
      ),
      coverImageId: v.optional(v.id("_storage")),
      imageIds: v.array(v.id("_storage")),
      expiresAt: v.optional(v.number()),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db.query("listings").collect();
  },
});

export const getListingsWithFilters = query({
  args: {
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    bankId: v.optional(v.id("banks")),
    countryId: v.optional(v.id("countries")),
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
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("sold"),
        v.literal("expired"),
        v.literal("removed")
      )
    ),
  },
  returns: v.array(
    v.object({
      _id: v.id("listings"),
      _creationTime: v.number(),
      vehicleId: v.id("vehicles"),
      bankId: v.id("banks"),
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
      price: v.optional(v.number()),
      currency: v.optional(v.string()),
      status: v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("sold"),
        v.literal("expired"),
        v.literal("removed")
      ),
      coverImageId: v.optional(v.id("_storage")),
      imageIds: v.array(v.id("_storage")),
      coverImageUrl: v.union(v.string(), v.null()),
      imageUrls: v.array(v.string()),
      expiresAt: v.optional(v.number()),
      vehicle: v.object({
        _id: v.id("vehicles"),
        _creationTime: v.number(),
        make: v.string(),
        model: v.string(),
        year: v.number(),
        slug: v.string(),
        fuelType: v.optional(v.string()),
        bodyType: v.optional(v.string()),
        driveTrain: v.optional(
          v.union(
            v.literal("FWD"),
            v.literal("RWD"),
            v.literal("AWD"),
            v.literal("4WD")
          )
        ),
        transmission: v.optional(v.string()),
        isActive: v.boolean(),
      }),
      bank: v.object({
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
      }),
      country: v.object({
        _id: v.id("countries"),
        _creationTime: v.number(),
        name: v.string(),
        code: v.string(),
        currency: v.string(),
        slug: v.string(),
        isActive: v.boolean(),
      }),
    })
  ),
  handler: async (ctx, args) => {
    let listings = await ctx.db.query("listings").collect();

    // Filter by status (default to active if not specified)
    const status = args.status || "active";
    listings = listings.filter((l) => l.status === status);

    // Filter by bank if specified
    if (args.bankId) {
      listings = listings.filter((l) => l.bankId === args.bankId);
    }

    // Filter by listing-specific properties
    if (args.color) {
      listings = listings.filter(
        (l) => l.color?.toLowerCase() === args.color?.toLowerCase()
      );
    }
    if (args.condition) {
      listings = listings.filter((l) => l.condition === args.condition);
    }
    if (args.minPrice) {
      listings = listings.filter((l) => l.price && l.price >= args.minPrice!);
    }
    if (args.maxPrice) {
      listings = listings.filter((l) => l.price && l.price <= args.maxPrice!);
    }

    // Get vehicle, bank, and country info for each listing
    const listingsWithDetails = await Promise.all(
      listings.map(async (listing) => {
        const vehicle = await ctx.db.get(listing.vehicleId);
        const bank = await ctx.db.get(listing.bankId);
        const country = bank ? await ctx.db.get(bank.countryId) : null;

        // Filter by vehicle properties if specified
        if (args.make && vehicle?.make !== args.make) return null;
        if (args.model && vehicle?.model !== args.model) return null;
        if (args.year && vehicle?.year !== args.year) return null;

        // Filter by country if specified
        if (args.countryId && bank?.countryId !== args.countryId) return null;

        // Convert storage IDs to actual URLs
        const coverImageUrl = listing.coverImageId
          ? await ctx.storage.getUrl(listing.coverImageId)
          : null;

        const imageUrls = await Promise.all(
          listing.imageIds.map(async (imageId) => {
            const url = await ctx.storage.getUrl(imageId);
            return url || "";
          })
        );

        const { allowedEmails, ...safeBank } = bank!;
        return {
          ...listing,
          coverImageUrl,
          imageUrls: imageUrls.filter((url) => url), // Remove empty URLs
          vehicle: vehicle!,
          bank: safeBank,
          country: country!,
        };
      })
    );

    // Filter out null entries
    return listingsWithDetails.filter((l) => l !== null);
  },
});

export const getListingsWithMarketStats = query({
  args: {
    make: v.optional(v.string()),
    model: v.optional(v.string()),
    year: v.optional(v.number()),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    bankId: v.optional(v.id("banks")),
    countryId: v.optional(v.id("countries")),
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
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("sold"),
        v.literal("expired"),
        v.literal("removed")
      )
    ),
  },
  returns: v.array(
    v.object({
      _id: v.id("listings"),
      _creationTime: v.number(),
      vehicleId: v.id("vehicles"),
      bankId: v.id("banks"),
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
      price: v.optional(v.number()),
      currency: v.optional(v.string()),
      status: v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("sold"),
        v.literal("expired"),
        v.literal("removed")
      ),
      coverImageId: v.optional(v.id("_storage")),
      imageIds: v.array(v.id("_storage")),
      coverImageUrl: v.union(v.string(), v.null()),
      imageUrls: v.array(v.string()),
      expiresAt: v.optional(v.number()),
      vehicle: v.object({
        _id: v.id("vehicles"),
        _creationTime: v.number(),
        make: v.string(),
        model: v.string(),
        year: v.number(),
        slug: v.string(),
        fuelType: v.optional(v.string()),
        bodyType: v.optional(v.string()),
        driveTrain: v.optional(
          v.union(
            v.literal("FWD"),
            v.literal("RWD"),
            v.literal("AWD"),
            v.literal("4WD")
          )
        ),
        transmission: v.optional(v.string()),
        isActive: v.boolean(),
      }),
      bank: v.object({
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
      }),
      country: v.object({
        _id: v.id("countries"),
        _creationTime: v.number(),
        name: v.string(),
        code: v.string(),
        currency: v.string(),
        slug: v.string(),
        isActive: v.boolean(),
      }),
      // Market stats
      medianPrice: v.optional(v.number()),
      priceDelta: v.optional(v.union(v.number(), v.null())),
      sampleSize: v.optional(v.number()),
    })
  ),
  handler: async (ctx, args) => {
    let listings = await ctx.db.query("listings").collect();

    // Filter by status (default to active if not specified)
    const status = args.status || "active";
    listings = listings.filter((l) => l.status === status);

    // Filter by bank if specified
    if (args.bankId) {
      listings = listings.filter((l) => l.bankId === args.bankId);
    }

    // Filter by listing-specific properties
    if (args.color) {
      listings = listings.filter(
        (l) => l.color?.toLowerCase() === args.color?.toLowerCase()
      );
    }
    if (args.condition) {
      listings = listings.filter((l) => l.condition === args.condition);
    }
    if (args.minPrice) {
      listings = listings.filter((l) => l.price && l.price >= args.minPrice!);
    }
    if (args.maxPrice) {
      listings = listings.filter((l) => l.price && l.price <= args.maxPrice!);
    }

    // Get vehicle, bank, and country info for each listing
    const listingsWithDetails = await Promise.all(
      listings.map(async (listing) => {
        const vehicle = await ctx.db.get(listing.vehicleId);
        const bank = await ctx.db.get(listing.bankId);
        const country = bank ? await ctx.db.get(bank.countryId) : null;

        // Filter by vehicle properties if specified
        if (args.make && vehicle?.make !== args.make) return null;
        if (args.model && vehicle?.model !== args.model) return null;
        if (args.year && vehicle?.year !== args.year) return null;

        // Filter by country if specified
        if (args.countryId && bank?.countryId !== args.countryId) return null;

        // Convert storage IDs to actual URLs
        const coverImageUrl = listing.coverImageId
          ? await ctx.storage.getUrl(listing.coverImageId)
          : null;

        const imageUrls = await Promise.all(
          listing.imageIds.map(async (imageId) => {
            const url = await ctx.storage.getUrl(imageId);
            return url || "";
          })
        );

        // Get market stats for this listing
        const marketStats = await ctx.db
          .query("marketStats")
          .withIndex("by_vehicle_country", (q) =>
            q.eq("vehicleSlug", vehicle!.slug).eq("countryId", country!._id)
          )
          .first();

        // Calculate price delta
        let priceDelta: number | null = null;
        if (
          marketStats &&
          marketStats.sampleSize >= 5 &&
          listing.price &&
          marketStats.medianPrice
        ) {
          priceDelta =
            ((listing.price - marketStats.medianPrice) /
              marketStats.medianPrice) *
            100;
        }

        const { allowedEmails, ...safeBank } = bank!;
        return {
          ...listing,
          coverImageUrl,
          imageUrls: imageUrls.filter((url) => url), // Remove empty URLs
          vehicle: vehicle!,
          bank: safeBank,
          country: country!,
          medianPrice: marketStats?.medianPrice,
          priceDelta,
          sampleSize: marketStats?.sampleSize,
        };
      })
    );

    // Filter out null entries
    return listingsWithDetails.filter((l) => l !== null);
  },
});

export const getListingsByVehicle = query({
  args: {
    vehicleId: v.id("vehicles"),
  },
  returns: v.array(
    v.object({
      _id: v.id("listings"),
      _creationTime: v.number(),
      vehicleId: v.id("vehicles"),
      bankId: v.id("banks"),
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
      price: v.optional(v.number()),
      currency: v.optional(v.string()),
      status: v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("sold"),
        v.literal("expired"),
        v.literal("removed")
      ),
      coverImageId: v.optional(v.id("_storage")),
      imageIds: v.array(v.id("_storage")),
      coverImageUrl: v.union(v.string(), v.null()),
      imageUrls: v.array(v.string()),
      expiresAt: v.optional(v.number()),
      bank: v.object({
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
      }),
    })
  ),
  handler: async (ctx, args) => {
    const listings = await ctx.db
      .query("listings")
      .withIndex("by_vehicle_bank", (q) => q.eq("vehicleId", args.vehicleId))
      .collect();

    const listingsWithBanks = await Promise.all(
      listings.map(async (listing) => {
        const bank = await ctx.db.get(listing.bankId);

        // Convert storage IDs to URLs
        const coverImageUrl = listing.coverImageId
          ? await ctx.storage.getUrl(listing.coverImageId)
          : null;

        const imageUrls = await Promise.all(
          listing.imageIds.map(async (imageId) => {
            const url = await ctx.storage.getUrl(imageId);
            return url || "";
          })
        );

        const { allowedEmails, ...safeBank } = bank!;
        return {
          ...listing,
          coverImageUrl,
          imageUrls: imageUrls.filter((url) => url),
          bank: safeBank,
        };
      })
    );

    return listingsWithBanks;
  },
});

export const getListingsByBank = query({
  args: {
    bankId: v.id("banks"),
  },
  returns: v.array(
    v.object({
      _id: v.id("listings"),
      _creationTime: v.number(),
      vehicleId: v.id("vehicles"),
      bankId: v.id("banks"),
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
      price: v.optional(v.number()),
      currency: v.optional(v.string()),
      status: v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("sold"),
        v.literal("expired"),
        v.literal("removed")
      ),
      coverImageId: v.optional(v.id("_storage")),
      imageIds: v.array(v.id("_storage")),
      coverImageUrl: v.union(v.string(), v.null()),
      imageUrls: v.array(v.string()),
      expiresAt: v.optional(v.number()),
      vehicle: v.object({
        _id: v.id("vehicles"),
        _creationTime: v.number(),
        make: v.string(),
        model: v.string(),
        year: v.number(),
        slug: v.string(),
        fuelType: v.optional(v.string()),
        bodyType: v.optional(v.string()),
        driveTrain: v.optional(
          v.union(
            v.literal("FWD"),
            v.literal("RWD"),
            v.literal("AWD"),
            v.literal("4WD")
          )
        ),
        transmission: v.optional(v.string()),
        isActive: v.boolean(),
      }),
    })
  ),
  handler: async (ctx, args) => {
    const listings = await ctx.db
      .query("listings")
      .withIndex("by_bank_status", (q) => q.eq("bankId", args.bankId))
      .collect();

    const listingsWithVehicles = await Promise.all(
      listings.map(async (listing) => {
        const vehicle = await ctx.db.get(listing.vehicleId);

        // Convert storage IDs to URLs
        const coverImageUrl = listing.coverImageId
          ? await ctx.storage.getUrl(listing.coverImageId)
          : null;

        const imageUrls = await Promise.all(
          listing.imageIds.map(async (imageId) => {
            const url = await ctx.storage.getUrl(imageId);
            return url || "";
          })
        );

        return {
          ...listing,
          coverImageUrl,
          imageUrls: imageUrls.filter((url) => url),
          vehicle: vehicle!,
        };
      })
    );

    return listingsWithVehicles;
  },
});

export const getListingById = query({
  args: {
    id: v.id("listings"),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("listings"),
      _creationTime: v.number(),
      vehicleId: v.id("vehicles"),
      bankId: v.id("banks"),
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
      price: v.optional(v.number()),
      currency: v.optional(v.string()),
      status: v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("sold"),
        v.literal("expired"),
        v.literal("removed")
      ),
      coverImageId: v.optional(v.id("_storage")),
      imageIds: v.array(v.id("_storage")),
      coverImageUrl: v.union(v.string(), v.null()),
      imageUrls: v.array(v.string()),
      expiresAt: v.optional(v.number()),
      vehicle: v.object({
        _id: v.id("vehicles"),
        _creationTime: v.number(),
        make: v.string(),
        model: v.string(),
        year: v.number(),
        slug: v.string(),
        fuelType: v.optional(v.string()),
        bodyType: v.optional(v.string()),
        driveTrain: v.optional(
          v.union(
            v.literal("FWD"),
            v.literal("RWD"),
            v.literal("AWD"),
            v.literal("4WD")
          )
        ),
        transmission: v.optional(v.string()),
        isActive: v.boolean(),
      }),
      bank: v.object({
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
      }),
      country: v.object({
        _id: v.id("countries"),
        _creationTime: v.number(),
        name: v.string(),
        code: v.string(),
        currency: v.string(),
        slug: v.string(),
        isActive: v.boolean(),
      }),
    })
  ),
  handler: async (ctx, args) => {
    const listing = await ctx.db.get(args.id);
    if (!listing) return null;

    const vehicle = await ctx.db.get(listing.vehicleId);
    const bank = await ctx.db.get(listing.bankId);
    const country = bank ? await ctx.db.get(bank.countryId) : null;

    if (!vehicle || !bank || !country) return null;

    // Convert storage IDs to URLs
    const coverImageUrl = listing.coverImageId
      ? await ctx.storage.getUrl(listing.coverImageId)
      : null;

    const imageUrls = await Promise.all(
      listing.imageIds.map(async (imageId) => {
        const url = await ctx.storage.getUrl(imageId);
        return url || "";
      })
    );

    const { allowedEmails, ...safeBank } = bank;
    return {
      ...listing,
      coverImageUrl,
      imageUrls: imageUrls.filter((url) => url),
      vehicle,
      bank: safeBank,
      country,
    };
  },
});

export const createListing = mutation({
  args: {
    vehicleId: v.id("vehicles"),
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
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    coverImageId: v.optional(v.id("_storage")),
    imageIds: v.array(v.id("_storage")),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("sold"),
        v.literal("expired"),
        v.literal("removed")
      )
    ),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    // Find the bank associated with the authenticated user
    const banks = await ctx.db.query("banks").collect();
    const bank = banks.find(
      (b) => b.allowedEmails?.includes(identity.email || "") ?? false
    );

    if (!bank) {
      throw new Error("Bank not found for authenticated user");
    }

    // Verify vehicle exists
    const vehicle = await ctx.db.get(args.vehicleId);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    // Validate images
    if (args.imageIds.length < 1) {
      throw new Error("At least one image is required");
    }

    // Validate price if present
    if (args.price !== undefined && args.price <= 0) {
      throw new Error("Price must be greater than 0");
    }

    // Validate mileage if present
    if (args.mileage !== undefined && args.mileage < 0) {
      throw new Error("Mileage cannot be negative");
    }

    const now = Date.now();
    const listingId = await ctx.db.insert("listings", {
      vehicleId: args.vehicleId,
      bankId: bank._id,
      mileage: args.mileage,
      color: args.color,
      condition: args.condition,
      price: args.price,
      currency: args.currency || "JMD", // Default to JMD
      status: args.status || "active",
      coverImageId: args.coverImageId,
      imageIds: args.imageIds,
      expiresAt: args.expiresAt,
    });

    // Create/update listingFilter record
    await ctx.scheduler.runAfter(0, internal.listingFilters.upsertListingFilter, {
      listingId,
    });

    // Update market stats if listing is active
    if ((args.status || "active") === "active") {
      // Note: Market stats will be updated on next query
      // This avoids scheduler complexity for now
    }

    return listingId;
  },
});

export const updateListing = mutation({
  args: {
    listingId: v.id("listings"),
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
    price: v.optional(v.number()),
    currency: v.optional(v.string()),
    coverImageId: v.optional(v.id("_storage")),
    imageIds: v.optional(v.array(v.id("_storage"))),
    status: v.optional(
      v.union(
        v.literal("draft"),
        v.literal("active"),
        v.literal("sold"),
        v.literal("expired"),
        v.literal("removed")
      )
    ),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    // Get the listing
    const listing = await ctx.db.get(args.listingId);
    if (!listing) {
      throw new Error("Listing not found");
    }

    // Find the bank associated with the authenticated user
    const banks = await ctx.db.query("banks").collect();
    const bank = banks.find(
      (b) => b.allowedEmails?.includes(identity.email || "") ?? false
    );

    if (!bank) {
      throw new Error("Bank not found for authenticated user");
    }

    // Verify user belongs to the bank that owns this listing
    if (listing.bankId !== bank._id) {
      throw new Error("Unauthorized to update this listing");
    }

    // Get vehicle for market stats update
    const vehicle = await ctx.db.get(listing.vehicleId);
    if (!vehicle) {
      throw new Error("Vehicle not found");
    }

    // Get current status to check if it's changing to/from active
    const currentStatus = listing.status;
    const newStatus = args.status || currentStatus;
    const isBecomingActive =
      currentStatus !== "active" && newStatus === "active";
    const isLeavingActive =
      currentStatus === "active" && newStatus !== "active";

    // Validate price if present
    if (args.price !== undefined && args.price <= 0) {
      throw new Error("Price must be greater than 0");
    }

    // Validate mileage if present
    if (args.mileage !== undefined && args.mileage < 0) {
      throw new Error("Mileage cannot be negative");
    }

    // Validate images if present
    if (args.imageIds !== undefined && args.imageIds.length < 1) {
      throw new Error("At least one image is required");
    }

    const now = Date.now();
    const updateData: any = {
      updatedAt: now,
    };

    if (args.mileage !== undefined) updateData.mileage = args.mileage;
    if (args.color !== undefined) updateData.color = args.color;
    if (args.condition !== undefined) updateData.condition = args.condition;
    if (args.price !== undefined) updateData.price = args.price;
    if (args.currency !== undefined) updateData.currency = args.currency;
    if (args.coverImageId !== undefined)
      updateData.coverImageId = args.coverImageId;
    if (args.imageIds !== undefined) updateData.imageIds = args.imageIds;
    if (args.status !== undefined) updateData.status = args.status;
    if (args.expiresAt !== undefined) updateData.expiresAt = args.expiresAt;

    await ctx.db.patch(args.listingId, updateData);

    // Update listingFilter record
    await ctx.scheduler.runAfter(0, internal.listingFilters.upsertListingFilter, {
      listingId: args.listingId,
    });

    // Update market stats if status is changing to/from active
    if (isBecomingActive || isLeavingActive) {
      // Note: Market stats will be updated on next query
      // This avoids scheduler complexity for now
    }

    return args.listingId;
  },
});
