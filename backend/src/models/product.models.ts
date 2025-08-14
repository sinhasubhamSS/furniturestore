import { Schema, model, Model, models, Document, Types } from "mongoose";
import slugify from "slugify";

// Variant Schema & Interface (Same as before)
export interface IVariant extends Document {
  sku: string;
  color: string;
  size: string;
  basePrice: number;
  gstRate: number;
  price: number;
  stock: number;
  images: {
    url: string;
    public_id: string; // Fixed underscore
  }[];
}

const variantSchema = new Schema<IVariant>({
  sku: { type: String, required: true },
  color: { type: String, required: true },
  size: { type: String, required: true },
  basePrice: { type: Number, required: true },
  gstRate: { type: Number, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true, default: 0 },
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true }, // Fixed underscore
    },
  ],
});

// Updated Product Interface (With Review Integration)
export interface IProduct extends Document {
  name: string;
  slug: string;
  title: string;
  description: string;
  specifications?: {
    section: string;
    specs: { key: string; value: string }[];
  }[];
  measurements?: {
    width?: number;
    height?: number;
    depth?: number;
    weight?: number;
  };
  variants: Types.DocumentArray<IVariant>;
  colors: string[];
  sizes: string[];
  warranty?: string;
  disclaimer?: string;
  category: Types.ObjectId;
  stock: number;
  price: number;
  createdBy: Types.ObjectId;
  createdAt: Date;
  isPublished: boolean;

  // Review Integration Fields
  reviewStats: {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
    verifiedReviews: number;
    reviewsWithImages: number;
    lastUpdated: Date;
  };

  // Review Settings
  reviewSettings: {
    allowReviews: boolean;
    requireVerification: boolean;
    autoApprove: boolean;
  };
}

// Static Methods Interface for Product
interface IProductModel extends Model<IProduct> {
  updateReviewStats(productId: string, stats: any): Promise<IProduct | null>;
  getByRatingRange(minRating: number, maxRating?: number): Promise<IProduct[]>;
  getTopRated(limit?: number): Promise<IProduct[]>;
}

// FIXED: Schema with proper typing
const productSchema = new Schema<IProduct, IProductModel>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },

    variants: {
      type: [variantSchema],
      required: true,
      validate: {
        validator: (v: IVariant[]) => v.length > 0,
        message: "At least one variant is required",
      },
    },

    specifications: [
      {
        section: { type: String, required: true },
        specs: [
          {
            key: { type: String, required: true },
            value: { type: String, required: true },
          },
        ],
      },
    ],

    measurements: {
      width: { type: Number },
      height: { type: Number },
      depth: { type: Number },
      weight: { type: Number },
    },

    colors: { type: [String], default: [] },
    sizes: { type: [String], default: [] },
    warranty: { type: String, default: "" },
    disclaimer: { type: String, default: "" },
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    stock: { type: Number, required: true, default: 0 },
    price: { type: Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isPublished: { type: Boolean, default: false },

    // Review Statistics (Cached for Performance)
    reviewStats: {
      averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        set: (v: number) => Math.round(v * 10) / 10, // Fixed multiplication
      },
      totalReviews: { type: Number, default: 0, min: 0 },
      ratingDistribution: {
        5: { type: Number, default: 0, min: 0 },
        4: { type: Number, default: 0, min: 0 },
        3: { type: Number, default: 0, min: 0 },
        2: { type: Number, default: 0, min: 0 },
        1: { type: Number, default: 0, min: 0 },
      },
      verifiedReviews: { type: Number, default: 0, min: 0 },
      reviewsWithImages: { type: Number, default: 0, min: 0 },
      lastUpdated: { type: Date, default: Date.now },
    },

    // Review Configuration
    reviewSettings: {
      allowReviews: { type: Boolean, default: true },
      requireVerification: { type: Boolean, default: false },
      autoApprove: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Pre-save middleware for slug generation
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      remove: /[*+~.()'"!:@]/g, // Fixed regex escaping
    });
  }
  next();
});

// Existing Indexes + New Review-related Indexes
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ stock: 1 });
productSchema.index({ "variants.sku": 1 }, { unique: true });

// Review-related Performance Indexes
productSchema.index({ "reviewStats.averageRating": -1 });
productSchema.index({ "reviewStats.totalReviews": -1 });
productSchema.index({
  "reviewStats.averageRating": -1,
  "reviewStats.totalReviews": -1,
});
productSchema.index({ "reviewSettings.allowReviews": 1 });
productSchema.index({ isPublished: 1, "reviewSettings.allowReviews": 1 });

// Text search index
productSchema.index(
  { name: "text", title: "text", description: "text" },
  {
    weights: { name: 10, title: 5, description: 3 },
    name: "productSearchIndex",
  }
);

// Virtual Fields for Reviews
productSchema.virtual("hasReviews").get(function (this: IProduct) {
  return this.reviewStats.totalReviews > 0;
});

productSchema.virtual("reviewsAllowed").get(function (this: IProduct) {
  return this.reviewSettings.allowReviews && this.isPublished;
});

productSchema.virtual("ratingDisplay").get(function (this: IProduct) {
  return this.reviewStats.averageRating > 0
    ? `${this.reviewStats.averageRating} (${this.reviewStats.totalReviews} reviews)` // Fixed template literal
    : "No reviews yet";
});

// Static Methods for Review Integration
productSchema.statics.updateReviewStats = async function (
  productId: string,
  stats: any
) {
  return await this.findByIdAndUpdate(
    productId,
    {
      "reviewStats.averageRating": stats.averageRating || 0,
      "reviewStats.totalReviews": stats.totalReviews || 0,
      "reviewStats.ratingDistribution": stats.ratingDistribution || {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
      "reviewStats.verifiedReviews": stats.verifiedReviews || 0,
      "reviewStats.reviewsWithImages": stats.reviewsWithImages || 0,
      "reviewStats.lastUpdated": new Date(),
    },
    { new: true }
  );
};

// Get products by rating range
productSchema.statics.getByRatingRange = function (
  minRating: number,
  maxRating: number = 5
) {
  return this.find({
    "reviewStats.averageRating": { $gte: minRating, $lte: maxRating },
    "reviewStats.totalReviews": { $gt: 0 },
    isPublished: true,
  }).sort({ "reviewStats.averageRating": -1 });
};

// Get top-rated products
productSchema.statics.getTopRated = function (limit: number = 10) {
  return this.find({
    "reviewStats.totalReviews": { $gte: 5 },
    isPublished: true,
  })
    .sort({ "reviewStats.averageRating": -1, "reviewStats.totalReviews": -1 })
    .limit(limit);
};

// CRITICAL FIX: Proper TypeScript Export
let Product: IProductModel;

if (models.Product) {
  Product = models.Product as IProductModel;
} else {
  Product = model<IProduct, IProductModel>("Product", productSchema);
}

export default Product;
