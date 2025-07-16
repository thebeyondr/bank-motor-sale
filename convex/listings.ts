import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

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
          v.literal("Excellent"),
          v.literal("Good"),
          v.literal("Fair"),
          v.literal("Unknown"),
          v.null()
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
    color: v.optional(v.string()),
    condition: v.optional(
      v.union(
        v.literal("Excellent"),
        v.literal("Good"),
        v.literal("Fair"),
        v.literal("Unknown")
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
          v.literal("Excellent"),
          v.literal("Good"),
          v.literal("Fair"),
          v.literal("Unknown"),
          v.null()
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
      vehicle: v.object({
        _id: v.id("vehicles"),
        _creationTime: v.number(),
        make: v.string(),
        model: v.string(),
        year: v.number(),
        slug: v.string(),
        fuelType: v.optional(v.string()),
        bodyType: v.optional(v.string()),
      }),
      bank: v.object({
        _id: v.id("banks"),
        _creationTime: v.number(),
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
    let listings = await ctx.db.query("listings").collect();

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

    // Get vehicle and bank info for each listing
    const listingsWithDetails = await Promise.all(
      listings.map(async (listing) => {
        const vehicle = await ctx.db.get(listing.vehicleId);
        const bank = await ctx.db.get(listing.bankId);

        // Filter by vehicle properties if specified
        if (args.make && vehicle?.make !== args.make) return null;
        if (args.model && vehicle?.model !== args.model) return null;
        if (args.year && vehicle?.year !== args.year) return null;

        // Convert storage IDs to actual URLs
        const imagesWithUrls = await Promise.all(
          listing.images.map(async (image) => {
            const url = await ctx.storage.getUrl(image.url as any);
            return {
              ...image,
              url: url || image.url, // Fallback to original if getUrl returns null
            };
          })
        );

        const { allowedEmails, ...safeBank } = bank!;
        return {
          ...listing,
          images: imagesWithUrls,
          vehicle: vehicle!,
          bank: safeBank,
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
          v.literal("Excellent"),
          v.literal("Good"),
          v.literal("Fair"),
          v.literal("Unknown"),
          v.null()
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
      bank: v.object({
        _id: v.id("banks"),
        _creationTime: v.number(),
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
        const bank = await ctx.db.get(listing.bankId);
        const { allowedEmails, ...safeBank } = bank!;
        return {
          ...listing,
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
          v.literal("Excellent"),
          v.literal("Good"),
          v.literal("Fair"),
          v.literal("Unknown"),
          v.null()
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
      vehicle: v.object({
        _id: v.id("vehicles"),
        _creationTime: v.number(),
        make: v.string(),
        model: v.string(),
        year: v.number(),
        slug: v.string(),
        fuelType: v.optional(v.string()),
        bodyType: v.optional(v.string()),
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
        const vehicle = await ctx.db.get(listing.vehicleId);

        // Convert storage IDs to actual URLs
        const imagesWithUrls = await Promise.all(
          listing.images.map(async (image) => {
            const url = await ctx.storage.getUrl(image.url as any);
            return {
              ...image,
              url: url || image.url, // Fallback to original if getUrl returns null
            };
          })
        );

        return {
          ...listing,
          images: imagesWithUrls,
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
          v.literal("Excellent"),
          v.literal("Good"),
          v.literal("Fair"),
          v.literal("Unknown"),
          v.null()
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
      vehicle: v.object({
        _id: v.id("vehicles"),
        _creationTime: v.number(),
        make: v.string(),
        model: v.string(),
        year: v.number(),
        slug: v.string(),
        fuelType: v.optional(v.string()),
        bodyType: v.optional(v.string()),
      }),
      bank: v.object({
        _id: v.id("banks"),
        _creationTime: v.number(),
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
    const listing = await ctx.db.get(args.id);
    if (!listing) return null;

    const vehicle = await ctx.db.get(listing.vehicleId);
    const bank = await ctx.db.get(listing.bankId);

    const { allowedEmails: _, ...safeBank } = bank!;
    return {
      ...listing,
      vehicle: vehicle!,
      bank: safeBank,
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
    if (args.images.length < 1) {
      throw new Error("At least one image is required");
    }

    const coverImages = args.images.filter((img) => img.isCover);
    if (coverImages.length !== 1) {
      throw new Error("Exactly one image must be marked as cover");
    }

    // Validate price if present
    if (args.price !== null && args.price <= 0) {
      throw new Error("Price must be greater than 0");
    }

    // Validate mileage if present
    if (args.mileage !== undefined && args.mileage < 0) {
      throw new Error("Mileage cannot be negative");
    }

    const listingId = await ctx.db.insert("listings", {
      vehicleId: args.vehicleId,
      bankId: bank._id,
      mileage: args.mileage,
      color: args.color,
      condition: args.condition,
      price: args.price,
      images: args.images,
      createdAt: Date.now(),
    });

    return listingId;
  },
});
