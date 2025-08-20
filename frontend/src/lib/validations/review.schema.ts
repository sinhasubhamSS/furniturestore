// types/schemas/reviewSchemas.ts
import { z } from "zod";

const reviewImageSchema = z.object({
  url: z.string().url({ message: "Invalid image URL" }),
  publicId: z.string().min(1, "Image public ID required"),
  caption: z.string().max(100, "Caption too long").optional(),
});

const reviewVideoSchema = z.object({
  url: z.string().url({ message: "Invalid video URL" }),
  publicId: z.string().min(1, "Video public ID required"),
  duration: z
    .number()
    .min(1)
    .max(300, "Video too long (max 5 minutes)")
    .optional(),
  caption: z.string().max(100, "Caption too long").optional(),
});

export const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID required"),
  rating: z.number().int("Rating must be integer").min(1).max(5),
  content: z
    .string()
    .min(1, "Review must be at least 1 character")
    .max(1000, "Review cannot exceed 1000 characters")
    .trim()
    .optional(),
  images: z
    .array(reviewImageSchema)
    .max(5, "Maximum 5 images allowed")
    .optional(),
  videos: z
    .array(reviewVideoSchema)
    .max(2, "Maximum 2 videos allowed")
    .optional(),
  isVerifiedPurchase: z.boolean().optional(),
});

// ✅ Update schema for partial updates
export const updateReviewSchema = createReviewSchema
  .omit({ productId: true })
  .partial();

// ✅ Types export करो
export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type UpdateReviewInput = z.infer<typeof updateReviewSchema>;
export type ReviewImageType = z.infer<typeof reviewImageSchema>;
export type ReviewVideoType = z.infer<typeof reviewVideoSchema>;
