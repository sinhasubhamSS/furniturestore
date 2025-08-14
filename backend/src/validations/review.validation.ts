// src/validations/review.validation.ts
import { z } from "zod";

// Remove the ObjectId preprocessing - keep it simple
const productIdSchema = z
  .string()
  .min(1, "Product ID is required")
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid product ID format");

// Image schema for reviews
const reviewImageSchema = z.object({
  url: z.string().url({ message: "Invalid image URL" }),
  publicId: z.string().min(1, "Image public ID required"),
  caption: z.string().max(100, "Caption too long").optional(),
});

// Video schema for reviews
const reviewVideoSchema = z.object({
  url: z.string().url({ message: "Invalid video URL" }),
  publicId: z.string().min(1, "Video public ID required"),
  duration: z.coerce
    .number()
    .min(1)
    .max(300, "Video too long (max 5 minutes)")
    .optional(),
  caption: z.string().max(100, "Caption too long").optional(),
});

// Create Review Schema - returns strings, not ObjectIds
export const createReviewSchema = z.object({
  body: z.object({
    productId: productIdSchema,

    rating: z.coerce.number().int("Rating must be integer").min(1).max(5),

    content: z
      .string()
      .min(10, "Review must be at least 10 characters")
      .max(1000, "Review cannot exceed 1000 characters")
      .trim(),

    images: z
      .array(reviewImageSchema)
      .max(5, "Maximum 5 images allowed")
      .optional()
      .default([]),

    videos: z
      .array(reviewVideoSchema)
      .max(2, "Maximum 2 videos allowed")
      .optional()
      .default([]),

    isVerifiedPurchase: z.coerce.boolean().optional().default(false),
  }),
});

// Update Review Schema
export const updateReviewSchema = z.object({
  params: z.object({
    reviewId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid review ID format"),
  }),

  body: z
    .object({
      rating: z.coerce.number().int().min(1).max(5).optional(),
      content: z.string().min(10).max(1000).trim().optional(),
      images: z.array(reviewImageSchema).max(5).optional(),
      videos: z.array(reviewVideoSchema).max(2).optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
});

// Query Schema
export const reviewQuerySchema = z.object({
  page: z.coerce.number().min(1).optional().default(1),
  limit: z.coerce.number().min(1).max(50).optional().default(10),
  sortBy: z
    .enum(["createdAt", "rating", "helpfulVotes"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
  rating: z.coerce.number().min(1).max(5).optional(),
  hasImages: z.coerce.boolean().optional(),
  hasVideos: z.coerce.boolean().optional(),
  verified: z.coerce.boolean().optional(),
});

// Export types
export type CreateReviewInput = z.infer<typeof createReviewSchema>["body"];
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewQuery = z.infer<typeof reviewQuerySchema>;
