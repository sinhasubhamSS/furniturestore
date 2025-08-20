// src/services/reviewService.ts

import { Review, IReview } from "../models/review.models";
import Product from "../models/product.models";
import { Types } from "mongoose";

// ✅ FIXED: Input types with optional content (Myntra-style)
type CreateReviewInput = {
  productId: string;
  userId: string;
  rating: number;
  content?: string; // ✅ Made optional for rating-only reviews
  images?: Array<{
    url: string;
    publicId: string;
    caption?: string;
  }>;
  videos?: Array<{
    url: string;
    publicId: string;
    thumbnail?: string;
    duration?: number;
    caption?: string;
  }>;
  isVerifiedPurchase?: boolean;
};

type UpdateReviewInput = Partial<CreateReviewInput>;

export class ReviewService {
  // ✅ FIXED: Create Review with optional content and upsert logic
  static async createReview(reviewData: CreateReviewInput): Promise<IReview> {
    try {
      // Validate product exists
      const product = await Product.findById(reviewData.productId);
      if (!product) throw new Error("Product not found");

      if (!product.reviewSettings?.allowReviews) {
        throw new Error("Reviews not allowed for this product");
      }

      // ✅ UPDATED: Use findOneAndUpdate for Myntra-style upsert
      // This allows user to first rate, then later add review content
      const review = await Review.findOneAndUpdate(
        {
          productId: new Types.ObjectId(reviewData.productId),
          userId: new Types.ObjectId(reviewData.userId),
        },
        {
          $set: {
            rating: reviewData.rating,
            content: reviewData.content || "", // ✅ Default empty string
            images: reviewData.images || [],
            videos: reviewData.videos || [],
            isVerifiedPurchase: reviewData.isVerifiedPurchase || false,
            helpfulVotes: 0,
          },
        },
        {
          upsert: true, // ✅ Create if doesn't exist, update if exists
          new: true, // ✅ Return updated document
          runValidators: true,
        }
      );

      // Update product stats
      await this.updateProductStats(reviewData.productId);

      return review;
    } catch (error) {
      throw error;
    }
  }

  // 2. Get Review by ID
  static async getReviewById(reviewId: string): Promise<IReview | null> {
    try {
      const review = await Review.findById(reviewId)
        .populate("userId", "name email avatar")
        .populate("productId", "name slug title");

      return review;
    } catch (error) {
      throw error;
    }
  }

  // ✅ FIXED: Update Review with optional content
  static async updateReview(
    reviewId: string,
    userId: string,
    updateData: UpdateReviewInput
  ): Promise<IReview | null> {
    try {
      const review = await Review.findById(reviewId);
      if (!review) throw new Error("Review not found");

      // Check if user owns this review
      if (review.userId.toString() !== userId) {
        throw new Error("You can only edit your own reviews");
      }

      // Validate at least one field is being updated
      const hasUpdates = Object.keys(updateData).length > 0;
      if (!hasUpdates) {
        throw new Error("At least one field must be provided for update");
      }

      // Update fields
      if (updateData.rating !== undefined) review.rating = updateData.rating;
      if (updateData.content !== undefined) review.content = updateData.content;
      if (updateData.images !== undefined) review.images = updateData.images;
      if (updateData.videos !== undefined) review.videos = updateData.videos;

      await review.save();

      // Update product stats
      await this.updateProductStats(review.productId.toString());

      return review;
    } catch (error) {
      throw error;
    }
  }

  // 4. Delete Review
  static async deleteReview(
    reviewId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const review = await Review.findById(reviewId);
      if (!review) throw new Error("Review not found");

      // Check ownership
      if (review.userId.toString() !== userId) {
        throw new Error("You can only delete your own reviews");
      }

      const productId = review.productId.toString();

      await Review.findByIdAndDelete(reviewId);

      // Update product stats
      await this.updateProductStats(productId);

      return true;
    } catch (error) {
      throw error;
    }
  }

  // 5. Get Product Reviews
  // src/services/reviewService.ts में getProductReviews method को update करें:
  static async getProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = "createdAt",
    sortOrder: string = "desc",
    rating?: number
  ) {
    try {
      const skip = (page - 1) * limit;

      // ✅ Build match conditions
      const matchConditions: any = { productId };
      if (rating) {
        matchConditions.rating = rating;
      }

      // ✅ Build sort conditions
      const sortConditions: any = {};
      sortConditions[sortBy] = sortOrder === "asc" ? 1 : -1;

      const [reviews, total] = await Promise.all([
        Review.find(matchConditions)
          .populate("userId", "name avatar")
          .populate("productId", "name slug title")
          .sort(sortConditions)
          .skip(skip)
          .limit(limit),

        Review.countDocuments(matchConditions),
      ]);

      return {
        success: true,
        reviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalReviews: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // 6. Get User Reviews
  static async getUserReviews(
    userId: string,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const skip = (page - 1) * limit; // ✅ Fixed multiplication

      const [reviews, total] = await Promise.all([
        Review.find({ userId })
          .populate("productId", "name slug title")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),

        Review.countDocuments({ userId }),
      ]);

      return {
        success: true,
        reviews,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalReviews: total,
          hasNext: page < Math.ceil(total / limit),
          hasPrev: page > 1,
        },
      };
    } catch (error) {
      throw error;
    }
  }

  // Helper: Update Product Review Stats
  private static async updateProductStats(productId: string) {
    try {
      const stats = await Review.getProductStats(productId);
      await Product.updateReviewStats(productId, stats);
    } catch (error) {
      console.error("Error updating product stats:", error);
      // Don't throw - stats update failure shouldn't break main operation
    }
  }
}
