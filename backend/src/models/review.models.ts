import { Schema, model, Model, Document, Types } from "mongoose";

// ✅ FIXED: Interface with optional fields
interface IReview extends Document {
  productId: Types.ObjectId;
  userId: Types.ObjectId;
  rating: number; // ✅ Required (stars)
  content?: string; // ✅ Optional (review text)
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  images: Array<{
    url: string;
    publicId: string;
    caption?: string;
  }>;
  videos: Array<{
    url: string;
    publicId: string;
    thumbnail?: string;
    duration?: number;
    caption?: string;
  }>;
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

    // ✅ FIXED: Rating is required (for Myntra-style star system)
    rating: {
      type: Number,
      required: true, // ✅ Added required
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: "Rating must be an integer between 1 and 5",
      },
    },

    // ✅ FIXED: Content is optional (for "Rate Product" vs "Write Review")
    content: {
      type: String,
      required: false, // ✅ Optional
   
      maxlength: 1000,
      trim: true,
      default: "", // ✅ Default empty
    },

    isVerifiedPurchase: {
      type: Boolean,
      default: false,
      index: true,
    },
    helpfulVotes: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ✅ FIXED: Images are optional
    images: [
      {
        url: {
          type: String,
          required: false, // ✅ Optional
          validate: {
            validator: function (v: string) {
              return !v || /^https?:\/\/.+\.(jpg|jpeg|png|webp|gif)$/i.test(v); // ✅ Fixed regex
            },
            message: "Invalid image URL format",
          },
        },
        publicId: { type: String, required: false }, // ✅ Optional
        caption: {
          type: String,
          maxlength: 100,
          trim: true,
        },
        _id: false, // ✅ Fixed underscore
      },
    ],

    // ✅ FIXED: Videos are optional
    videos: [
      {
        url: {
          type: String,
          required: false, // ✅ Optional
          validate: {
            validator: function (v: string) {
              return !v || /^https?:\/\/.+\.(mp4|mov|avi|mkv|webm)$/i.test(v); // ✅ Fixed regex
            },
            message: "Invalid video URL format",
          },
        },
        publicId: { type: String, required: false }, // ✅ Optional
        thumbnail: {
          type: String,
          validate: {
            validator: function (v: string) {
              return !v || /^https?:\/\/.+\.(jpg|jpeg|png|webp)$/i.test(v); // ✅ Fixed regex
            },
            message: "Invalid thumbnail URL format",
          },
        },
        duration: {
          type: Number,
          min: 1,
          max: 300,
        },
        caption: {
          type: String,
          maxlength: 100,
          trim: true,
        },
        _id: false, // ✅ Fixed underscore
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes (same as before)
reviewSchema.index({ productId: 1, createdAt: -1 });
reviewSchema.index({ productId: 1, rating: 1 });
reviewSchema.index({ userId: 1, createdAt: -1 });
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
reviewSchema.index({ "videos.0": 1 }, { sparse: true });

// ✅ ENHANCED: Virtual Fields for Myntra-style categorization
reviewSchema.virtual("hasImages").get(function (this: IReview) {
  return this.images.length > 0;
});

reviewSchema.virtual("hasVideos").get(function (this: IReview) {
  return this.videos.length > 0;
});

reviewSchema.virtual("hasMedia").get(function (this: IReview) {
  return this.images.length > 0 || this.videos.length > 0;
});

reviewSchema.virtual("hasContent").get(function (this: IReview) {
  return this.content && this.content.trim().length > 0;
});

// ✅ NEW: Myntra-style review type classification
// ✅ FIXED: Directly access actual fields, not virtual ones
reviewSchema.virtual("reviewType").get(function (this: IReview) {
  // Direct field access instead of virtual field access
  const hasText = this.content && this.content.trim().length > 0;
  const hasMedia =
    (this.images && this.images.length > 0) ||
    (this.videos && this.videos.length > 0);

  if (hasText && hasMedia) return "detailed"; // Full review with text + media
  if (hasText) return "text-review"; // Text review only
  if (hasMedia) return "media-review"; // Media review only
  return "rating-only"; // Just star rating
});

reviewSchema.virtual("totalMediaCount").get(function (this: IReview) {
  return this.images.length + this.videos.length;
});

reviewSchema.virtual("ageInDays").get(function (this: IReview) {
  return Math.floor(
    (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24) // ✅ Fixed multiplication
  );
});

// Static Method (fixed underscores)
reviewSchema.statics.getProductStats = async function (productId: string) {
  const stats = await this.aggregate([
    {
      $match: {
        productId: new Types.ObjectId(productId),
      },
    },
    {
      $group: {
        _id: null, // ✅ Fixed underscore
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

export const Review = model<IReview, IReviewModel>("Review", reviewSchema);
export type { IReview };
