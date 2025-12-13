// src/services/reviewService.ts
import { Review, IReview } from "../models/review.models";
import Product from "../models/product.models";
import { Order, OrderStatus } from "../models/order.models";
import { Types } from "mongoose";

/* ---------- Reusable media types to avoid duplication ---------- */
type MediaImage = { url: string; publicId: string; caption?: string };
type MediaVideo = {
  url: string;
  publicId: string;
  thumbnail?: string;
  duration?: number;
  caption?: string;
};

/* ---------- DTO (uses above media types) ---------- */
export type CreateReviewInput = {
  productId: string;
  userId: string;
  rating: number;
  content?: string;
  images?: MediaImage[];
  videos?: MediaVideo[];
  // Do NOT trust client-sent isOfflineBuyer — server will determine based on orderId
  orderId?: string; // optional order reference (server-verified)
};

type UpdateReviewInput = Partial<CreateReviewInput>;

/* ---------- Allowed sort fields (security) ---------- */
const ALLOWED_SORT_FIELDS = ["createdAt", "rating", "helpfulVotes"];

export class ReviewService {
  // ---------------------------------------
  // CREATE REVIEW (server-driven verification)
  // ---------------------------------------
  static async createReview(reviewData: CreateReviewInput): Promise<IReview> {
    try {
      console.debug("createReview called with:", JSON.stringify(reviewData));
      const { productId, userId, rating, content, images, videos, orderId } =
        reviewData;

      // ---- Basic parameter validation ----
      if (!productId) throw new Error("productId is required");
      if (!userId)
        throw new Error("userId is required (should come from auth)");
      if (typeof rating !== "number" || rating < 1 || rating > 5)
        throw new Error("rating must be a number between 1 and 5");

      // Prevent invalid ObjectId casts
      if (!Types.ObjectId.isValid(productId))
        throw new Error("productId is not a valid id");
      if (!Types.ObjectId.isValid(userId))
        throw new Error("userId is not a valid id");

      // basic sanitization
      const trimmedContent = (content || "").trim().slice(0, 1000);

      // Check product exists & review settings
      const product = await Product.findById(productId).lean();
      if (!product) throw new Error("Product not found");
      if (!product.reviewSettings?.allowReviews) {
        throw new Error("Reviews not allowed for this product");
      }

      // -------------------------
      // Server-driven buyer type
      // -------------------------
      let finalIsOfflineBuyer = true;
      let isVerifiedPurchase = false;
      let status: "pending" | "approved" = "pending";

      // resolvedOrderDbId will store the Order._id (ObjectId string) when found
      let resolvedOrderDbId: string | undefined = undefined;

      if (orderId) {
        // resolve order by either Mongo _id or external orderId field
        let order: any = null;

        // Try ObjectId lookup first (fast path)
        if (Types.ObjectId.isValid(orderId)) {
          order = await Order.findById(orderId)
            .lean()
            .catch(() => null);
        }

        // Fallback: find by external orderId string
        if (!order) {
          order = await Order.findOne({ orderId: orderId })
            .lean()
            .catch(() => null);
        }

        if (!order) throw new Error("Order not found");

        // ensure order belongs to user
        if (!order.user || String(order.user) !== String(userId)) {
          throw new Error("Order does not belong to user");
        }

        // check delivered status (defensive)
        const isDelivered =
          String(order.status).toLowerCase() === "delivered" ||
          !!order.trackingInfo?.actualDelivery ||
          !!order.deliverySnapshot?.estimatedDelivery ||
          !!order.deliveredAt;

        // check that the order contains the product (support snapshot or summary)
        const containsProduct =
          (Array.isArray(order.orderItemsSnapshot) &&
            order.orderItemsSnapshot.some(
              (it: any) => String(it.productId) === String(productId)
            )) ||
          (Array.isArray(order.orderItemsSummary) &&
            order.orderItemsSummary.some(
              (it: any) => String(it.productId) === String(productId)
            ));

        if (!isDelivered || !containsProduct) {
          throw new Error(
            "Order must be delivered and must contain the product to post a verified online review"
          );
        }

        // Verified / online review
        finalIsOfflineBuyer = false;
        isVerifiedPurchase = true;
        status = "approved";
        resolvedOrderDbId = String(order._id);
      } else {
        // offline path - require media
        const hasMedia = (images?.length || 0) > 0 || (videos?.length || 0) > 0;
        if (!hasMedia) {
          throw new Error(
            "Offline buyer must upload at least 1 image or video."
          );
        }
        finalIsOfflineBuyer = true;
        isVerifiedPurchase = false;
        status = "pending";
      }

      // -------------------------
      // Build update payload & upsert (safe)
      // -------------------------
      const updatePayload: any = {
        rating,
        content: trimmedContent || undefined,
        isOfflineBuyer: finalIsOfflineBuyer,
        isVerifiedPurchase,
        status,
        helpfulVotes: 0,
      };

      if (images !== undefined) updatePayload.images = images;
      if (videos !== undefined) updatePayload.videos = videos;
      if (resolvedOrderDbId) {
        // validated above so safe to convert
        updatePayload.orderId = new Types.ObjectId(resolvedOrderDbId);
      }

      // Upsert filter and update with $setOnInsert to ensure required fields on insert
      const filter = {
        productId: new Types.ObjectId(productId),
        userId: new Types.ObjectId(userId),
      };

      const update = {
        $set: updatePayload,
        $setOnInsert: {
          productId: new Types.ObjectId(productId),
          userId: new Types.ObjectId(userId),
          createdAt: new Date(),
        },
      };

      const opts = {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      };

      const reviewDoc = await Review.findOneAndUpdate(
        filter,
        update,
        opts
      ).exec();

      // Defensive null-check so return type Promise<IReview> is satisfied
      if (!reviewDoc) {
        throw new Error("Failed to create or fetch review after upsert");
      }

      const review = reviewDoc as unknown as IReview;

      // Update product stats (non-fatal; log errors but don't fail request)
      try {
        await this.updateProductStats(productId);
      } catch (err) {
        console.error("updateProductStats failed (non-fatal):", err);
      }

      // Best-effort: mark order item as reviewed (non-blocking)
      if (resolvedOrderDbId) {
        Order.updateOne(
          {
            _id: new Types.ObjectId(resolvedOrderDbId),
            "orderItemsSnapshot.productId": new Types.ObjectId(productId),
          },
          { $set: { "orderItemsSnapshot.$._reviewedByUser": true } }
        ).catch((e) => console.error("mark order item reviewed failed:", e));
      }

      return review;
    } catch (error: any) {
      // Improved logging for easier debugging
      console.error("createReview error:", {
        message: error?.message,
        stack: error?.stack,
        input: reviewData,
      });
      // Re-throw so controller can map to proper HTTP response
      throw error;
    }
  }

  // ---------------------------------------
  // GET REVIEW BY ID
  // ---------------------------------------
  static async getReviewById(reviewId: string): Promise<IReview | null> {
    return await Review.findById(reviewId)
      .populate("userId", "name email avatar")
      .populate("productId", "name slug title");
  }

  // ---------------------------------------
  // UPDATE REVIEW (user edits)
  // ---------------------------------------
  static async updateReview(
    reviewId: string,
    userId: string,
    updateData: UpdateReviewInput
  ): Promise<IReview | null> {
    try {
      const review = await Review.findById(reviewId);
      if (!review) throw new Error("Review not found");

      if (review.userId.toString() !== userId) {
        throw new Error("You can only edit your own reviews");
      }

      const hasUpdates = Object.keys(updateData).length > 0;
      if (!hasUpdates) throw new Error("Nothing to update");

      // allow edits only to rating/content/images/videos
      if (updateData.rating !== undefined) review.rating = updateData.rating;
      if (updateData.content !== undefined)
        review.content = (updateData.content || "").trim().slice(0, 1000);
      if (updateData.images !== undefined) review.images = updateData.images;
      if (updateData.videos !== undefined) review.videos = updateData.videos;

      // keep offline reviews in pending state after edit (admin must re-approve)
      if (review.isOfflineBuyer) {
        review.status = "pending";
      } else {
        review.status = "approved";
      }

      await review.save();

      // Update product stats (approved-only)
      await this.updateProductStats(review.productId.toString());

      return review;
    } catch (error) {
      throw error;
    }
  }

  // ---------------------------------------
  // DELETE REVIEW (user)
  // ---------------------------------------
  static async deleteReview(
    reviewId: string,
    userId: string
  ): Promise<boolean> {
    const review = await Review.findById(reviewId);
    if (!review) throw new Error("Review not found");

    if (review.userId.toString() !== userId) {
      throw new Error("You can only delete your own reviews");
    }

    const productId = review.productId.toString();
    await Review.findByIdAndDelete(reviewId);

    await this.updateProductStats(productId);
    return true;
  }

  // ---------------------------------------
  // GET PRODUCT REVIEWS — PUBLIC (approved only)
  // ---------------------------------------
  static async getProductReviews(
    productId: string,
    page: number = 1,
    limit: number = 10,
    sortBy: string = "createdAt",
    sortOrder: string = "desc",
    rating?: number
  ) {
    const skip = (page - 1) * limit;

    // Security: only allow safe fields
    if (!ALLOWED_SORT_FIELDS.includes(sortBy)) sortBy = "createdAt";

    const sortConditions: any = {
      [sortBy]: sortOrder === "asc" ? 1 : -1,
    };

    // Only show approved reviews to public
    const match: any = {
      productId: new Types.ObjectId(productId),
      status: "approved",
    };
    if (rating) match.rating = rating;

    const [reviews, total] = await Promise.all([
      Review.find(match)
        .populate("userId", "name avatar")
        .sort(sortConditions)
        .skip(skip)
        .limit(limit),

      Review.countDocuments(match),
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
  }

  // ---------------------------------------
  // GET USER REVIEWS (all statuses)
  // ---------------------------------------
  static async getUserReviews(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      Review.find({ userId: new Types.ObjectId(userId) })
        .populate("productId", "name slug title")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      Review.countDocuments({ userId: new Types.ObjectId(userId) }),
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
  }

  // ---------------------------------------
  // ADMIN: Approve a pending review
  // Note: ensure admin auth/authorization in controller/middleware
  // ---------------------------------------
  static async adminApproveReview(reviewId: string): Promise<IReview | null> {
    const review = await Review.findById(reviewId);
    if (!review) throw new Error("Review not found");

    review.status = "approved";
    await review.save();

    // update stats for product
    await this.updateProductStats(review.productId.toString());

    return review;
  }

  // ---------------------------------------
  // ADMIN: Reject a pending review
  // ---------------------------------------
  static async adminRejectReview(reviewId: string, reason?: string) {
    const review = await Review.findById(reviewId);
    if (!review) throw new Error("Review not found");

    review.status = "rejected";
    // optionally: store rejection reason somewhere or emit audit log (not implemented here)
    await review.save();

    // update stats (rejected reviews shouldn't be counted)
    await this.updateProductStats(review.productId.toString());

    return review;
  }

  // ---------------------------------------
  // UPDATE PRODUCT STATS (only counts approved via model statics)
  // ---------------------------------------
  private static async updateProductStats(productId: string) {
    try {
      const stats = await (Review as any).getProductStats(productId);
      await Product.updateReviewStats(productId, stats);
    } catch (error) {
      console.error("Stats update failed:", error);
    }
  }
}
