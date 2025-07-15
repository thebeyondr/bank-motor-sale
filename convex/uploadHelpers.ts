import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    // Find the bank associated with the authenticated user
    const banks = await ctx.db.query("banks").collect();
    const bank = banks.find(b => 
      b.contactInfo.emails.includes(identity.email || "")
    );

    if (!bank) {
      throw new Error("Bank not found for authenticated user");
    }

    // Generate upload URL
    return await ctx.storage.generateUploadUrl();
  },
});

export const getFileUrl = mutation({
  args: { 
    storageId: v.id("_storage") 
  },
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    return await ctx.storage.getUrl(args.storageId);
  },
});

// Helper function to validate uploaded file
export const validateUploadedFile = mutation({
  args: {
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Check authentication
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }

    // Get file metadata
    const file = await ctx.storage.getMetadata(args.storageId);
    if (!file) {
      throw new Error("File not found");
    }

    // Validate file type (images only)
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.contentType!)) {
      throw new Error("Only JPEG, PNG, and WebP images are allowed");
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error("File size must be less than 5MB");
    }

    return {
      url: await ctx.storage.getUrl(args.storageId),
      contentType: file.contentType,
      size: file.size,
    };
  },
});