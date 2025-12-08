// src/models/review.models.ts
import { Schema, model, Model, Document, Types } from "mongoose";

// -----------------------------
// Interfaces
// -----------------------------
export type ReviewStatus = "pending" | "approved" | "rejected";

interface IMediaImage {
  url: string;
  publicId?: string;
  caption?: string;
}

interface IMediaVideo {
  url: string;
  publicId?: string;
  thumbnail?: string;
  duration?: number;
  caption?: string;
}

interface IReview extends Document {
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number;
  content?: string;
  isVerifiedPurchase: boolean;
  isOfflineBuyer: boolean; // NEW
  status: ReviewStatus; // NEW
  orderId?: Types.ObjectId;
  helpfulVotes: number;
  images: IMediaImage[];
  videos: IMediaVideo[];
  createdAt: Date;
  updatedAt: Date;
}

interface IReviewModel extends Model<IReview> {
  getProductStats(productId: string): Promise<{
    averageRating: number;
    totalReviews: number;
    verifiedReviews: number;
    reviewsWithImages: number;
    reviewsWithVideos: number;
    reviewsWithMedia: number;
    totalImages: number;
    totalVideos: number;
    ratingDistribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
  }>;
}

// -----------------------------
// Schema
// -----------------------------
const reviewSchema = new Schema<IReview>(
  {
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer between 1 and 5",
      },
    },

    content: {
      type: String,
      required: false,
      maxlength: 1000,
      trim: true,
      default: "",
    },

    isVerifiedPurchase: {
      type: Boolean,
      default: false,
      index: true,
    },

    // NEW: marks reviews submitted as offline-buyer (requires manual approval)
    isOfflineBuyer: {
      type: Boolean,
      default: false,
      index: true,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: false,
      index: true,
    },

    // NEW: approval workflow for offline/other reviews
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending", // online reviews remain approved by default
      index: true,
    },

    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0,
    },

    images: {
      type: [
        {
          url: {
            type: String,
            required: false,
            validate: {
              validator: function (v: string) {
                return (
                  !v ||
                  /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)(?:[?#].*)?$/i.test(v)
                );
              },
              message: "Invalid image URL format",
            },
          },
          publicId: { type: String, required: false },
          caption: { type: String, maxlength: 100, trim: true },
          _id: false,
        },
      ],
      default: [],
      validate: {
        validator: (arr: any[]) => Array.isArray(arr) && arr.length <= 8,
        message: "Max 8 images allowed",
      },
    },

    videos: {
      type: [
        {
          url: {
            type: String,
            required: false,
            validate: {
              validator: function (v: string) {
                return (
                  !v ||
                  /^https?:\/\/.+\.(mp4|mov|avi|mkv|webm)(?:[?#].*)?$/i.test(v)
                );
              },
              message: "Invalid video URL format",
            },
          },
          publicId: { type: String, required: false },
          thumbnail: {
            type: String,
            required: false,
            validate: {
              validator: function (v: string) {
                return (
                  !v ||
                  /^https?:\/\/.+\.(jpg|jpeg|png|webp)(?:[?#].*)?$/i.test(v)
                );
              },
              message: "Invalid thumbnail URL format",
            },
          },
          duration: { type: Number, min: 1, max: 300 },
          caption: { type: String, maxlength: 100, trim: true },
          _id: false,
        },
      ],
      default: [],
      validate: {
        validator: (arr: any[]) => Array.isArray(arr) && arr.length <= 2,
        message: "Max 2 videos allowed",
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        const out: any = ret;
        out.id = out._id;
        delete out._id;
        delete out.__v;
        return out;
      },
    },
    toObject: { virtuals: true },
  }
);

// -----------------------------
// Indexes
// -----------------------------
reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ productId: 1, rating: 1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ "videos.0": 1 }, { sparse: true });

// -----------------------------
// Virtuals
// -----------------------------
reviewSchema.virtual("hasImages").get(function (this: IReview) {
  return Array.isArray(this.images) && this.images.length > 0;
});

reviewSchema.virtual("hasVideos").get(function (this: IReview) {
  return Array.isArray(this.videos) && this.videos.length > 0;
});

reviewSchema.virtual("hasMedia").get(function (this: IReview) {
  return (
    (Array.isArray(this.images) && this.images.length > 0) ||
    (Array.isArray(this.videos) && this.videos.length > 0)
  );
});

reviewSchema.virtual("hasContent").get(function (this: IReview) {
  return !!this.content && this.content.trim().length > 0;
});

reviewSchema.virtual("reviewType").get(function (this: IReview) {
  const hasText = !!this.content && this.content.trim().length > 0;
  const hasMedia =
    (Array.isArray(this.images) && this.images.length > 0) ||
    (Array.isArray(this.videos) && this.videos.length > 0);

  if (hasText && hasMedia) return "detailed";
  if (hasText) return "text-review";
  if (hasMedia) return "media-review";
  return "rating-only";
});

reviewSchema.virtual("totalMediaCount").get(function (this: IReview) {
  return (
    (Array.isArray(this.images) ? this.images.length : 0) +
    (Array.isArray(this.videos) ? this.videos.length : 0)
  );
});

reviewSchema.virtual("ageInDays").get(function (this: IReview) {
  return Math.floor(
    (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  );
});
reviewSchema.pre("validate", function (next) {
  try {
    const doc: any = this;

    // If offline buyer, require at least one image OR one video
    if (doc.isOfflineBuyer) {
      const hasImages = Array.isArray(doc.images) && doc.images.length > 0;
      const hasVideos = Array.isArray(doc.videos) && doc.videos.length > 0;

      if (!hasImages && !hasVideos) {
        const err: any = new Error(
          "Offline reviews require at least one image or one video."
        );
        err.name = "ValidationError";
        return next(err);
      }
    }

    // If marked verified purchase MUST have an orderId
    if (doc.isVerifiedPurchase && !doc.orderId) {
      const err: any = new Error(
        "Verified purchase reviews must include an orderId."
      );
      err.name = "ValidationError";
      return next(err);
    }

    next();
  } catch (e) {
    next(e as any); 
  }
});

// -----------------------------
// Statics
// -----------------------------
reviewSchema.statics.getProductStats = async function (productId: string) {
  // NOTE: Only include APPROVED reviews for product stats (pending/rejected not counted)
  const stats = await this.aggregate([
    {
      $match: {
        productId: new Types.ObjectId(productId),
        status: "approved",
      },
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        verifiedReviews: { $sum: { $cond: ["$isVerifiedPurchase", 1, 0] } },
        reviewsWithImages: {
          $sum: { $cond: [{ $gt: [{ $size: "$images" }, 0] }, 1, 0] },
        },
        reviewsWithVideos: {
          $sum: { $cond: [{ $gt: [{ $size: "$videos" }, 0] }, 1, 0] },
        },
        reviewsWithMedia: {
          $sum: {
            $cond: [
              {
                $or: [
                  { $gt: [{ $size: "$images" }, 0] },
                  { $gt: [{ $size: "$videos" }, 0] },
                ],
              },
              1,
              0,
            ],
          },
        },
        totalImages: { $sum: { $size: "$images" } },
        totalVideos: { $sum: { $size: "$videos" } },
        ratings: { $push: "$rating" },
      },
    },
    {
      $project: {
        averageRating: { $round: ["$averageRating", 1] },
        totalReviews: 1,
        verifiedReviews: 1,
        reviewsWithImages: 1,
        reviewsWithVideos: 1,
        reviewsWithMedia: 1,
        totalImages: 1,
        totalVideos: 1,
        ratingDistribution: {
          5: {
            $size: {
              $filter: { input: "$ratings", cond: { $eq: ["$$this", 5] } },
            },
          },
          4: {
            $size: {
              $filter: { input: "$ratings", cond: { $eq: ["$$this", 4] } },
            },
          },
          3: {
            $size: {
              $filter: { input: "$ratings", cond: { $eq: ["$$this", 3] } },
            },
          },
          2: {
            $size: {
              $filter: { input: "$ratings", cond: { $eq: ["$$this", 2] } },
            },
          },
          1: {
            $size: {
              $filter: { input: "$ratings", cond: { $eq: ["$$this", 1] } },
            },
          },
        },
      },
    },
  ]);

  return (
    stats[0] || {
      averageRating: 0,
      totalReviews: 0,
      verifiedReviews: 0,
      reviewsWithImages: 0,
      reviewsWithVideos: 0,
      reviewsWithMedia: 0,
      totalImages: 0,
      totalVideos: 0,
      ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    }
  );
};

// -----------------------------
// Export
// -----------------------------
export const Review = model<IReview, IReviewModel>("Review", reviewSchema);
export type { IReview, IReviewModel, IMediaImage, IMediaVideo };
