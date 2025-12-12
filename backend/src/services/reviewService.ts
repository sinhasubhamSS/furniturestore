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
      const { productId, userId, rating, content, images, videos, orderId } =
        reviewData;

      // basic sanitization
      const trimmedContent = (content || "").trim().slice(0, 1000);

      // Check product exists
      const product = await Product.findById(productId).lean();
      if (!product) throw new Error("Product not found");

      // Check if reviews allowed for product
      if (!product.reviewSettings?.allowReviews) {
        throw new Error("Reviews not allowed for this product");
      }

      // -------------------------
      // Server-driven buyer type
      // -------------------------
      // We DO NOT trust client-provided isOfflineBuyer flag.
      // If orderId provided -> validate it belongs to user, contains product, and is delivered.
      // Otherwise treat as offline buyer: require at least one image or video and mark pending.
      let finalIsOfflineBuyer = true;
      let isVerifiedPurchase = false;
      let status: "pending" | "approved" = "pending";

      // We'll keep resolvedOrderDbId when we find it so we store DB ObjectId
      let resolvedOrderDbId: string | undefined = undefined;

      if (orderId) {
        // resolve order by either _id or external orderId field
        let order: any = null;

        // try treat orderId as MongoDB ObjectId first (fast path)
        try {
          order = await Order.findById(orderId).lean();
        } catch (e) {
          // invalid ObjectId -> ignore and fallback
          order = null;
        }

        // fallback: try to find by external orderId field (e.g. "ORD-1234")
        if (!order) {
          order = await Order.findOne({ orderId: orderId }).lean();
        }

        if (!order) throw new Error("Order not found");

        // ensure order belongs to user
        if (!order.user || order.user.toString() !== userId.toString()) {
          throw new Error("Order does not belong to user");
        }

        // check delivered status — adapt to your actual schema fields:
        // prefer Order.status === OrderStatus.Delivered, fallback to trackingInfo.actualDelivery or deliverySnapshot.estimatedDelivery
        const isDelivered =
          String(order.status) === String(OrderStatus.Delivered) ||
          !!order.trackingInfo?.actualDelivery ||
          !!order.deliverySnapshot?.estimatedDelivery ||
          // fallback: if you store deliveredAt date
          !!order.deliveredAt;

        // check that the order contains the product using your `orderItemsSnapshot`
        const containsProduct =
          Array.isArray(order.orderItemsSnapshot) &&
          order.orderItemsSnapshot.some((it: any) => {
            // productId may be ObjectId -> convert to string
            const pid = it.productId?.toString?.();
            return pid === productId.toString();
          });

        if (!isDelivered || !containsProduct) {
          throw new Error(
            "Order must be delivered and must contain the product to post a verified online review"
          );
        }

        // If validations pass, mark as online verified
        finalIsOfflineBuyer = false;
        isVerifiedPurchase = true;
        status = "approved";

        // store DB _id for order
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
        status = "pending"; // admin approval required
      }

      // -------------------------
      // Build update payload & upsert
      // -------------------------
      const updatePayload: any = {
        rating,
        content: trimmedContent,
        isOfflineBuyer: finalIsOfflineBuyer,
        isVerifiedPurchase,
        status,
        helpfulVotes: 0,
      };

      if (images !== undefined) updatePayload.images = images;
      if (videos !== undefined) updatePayload.videos = videos;
      if (resolvedOrderDbId) updatePayload.orderId = new Types.ObjectId(resolvedOrderDbId);

      // Use ObjectId for match keys and upsert (one review per user-product)
      const review = await Review.findOneAndUpdate(
        {
          productId: new Types.ObjectId(productId),
          userId: new Types.ObjectId(userId),
        },
        { $set: updatePayload },
        {
          upsert: true,
          new: true,
          runValidators: true,
        }
      );

      // Update product stats (model getProductStats only counts approved)
      await this.updateProductStats(productId);

      return review;
    } catch (error) {
      // bubble error up (controllers should handle and return proper HTTP codes)
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
