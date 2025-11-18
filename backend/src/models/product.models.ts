import { Schema, model, Model, models, Document, Types } from "mongoose";
import slugify from "slugify";

// Variant Interface including discount fields
export interface IVariant extends Document {
  sku: string;
  color: string;
  size: string;

  basePrice: number;
  gstRate: number;

  price: number;
  discountedPrice: number;
  savings: number;

  hasDiscount: boolean;
  discountPercent: number;
  discountValidUntil?: Date;

  stock: number;
  reservedStock: number;
  images: {
    url: string;
    public_id: string;
  }[];
}

// Variant Schema with discount fields and default values
const variantSchema = new Schema<IVariant>({
  sku: { type: String, required: true },
  color: { type: String, required: true },
  size: { type: String, required: true },

  basePrice: { type: Number, required: true },
  gstRate: { type: Number, required: true },

  price: { type: Number, default: 0 },
  discountedPrice: { type: Number, default: 0 },
  savings: { type: Number, default: 0 },

  hasDiscount: { type: Boolean, default: false },
  discountPercent: { type: Number, default: 0, min: 0, max: 70 },
  discountValidUntil: { type: Date },

  stock: { type: Number, required: true, default: 0 },
  reservedStock: { type: Number, default: 0 },
  images: [
    {
      url: { type: String, required: true },
      public_id: { type: String, required: true },
      thumbSmart: { type: String },
      thumbSafe: { type: String },
      blurDataURL: { type: String },
      isPrimary: { type: Boolean, default: false }, // <-- new
    },
  ],
});

// Pre-save hook for variant to calculate price, discountedPrice and savings
variantSchema.pre("save", function (this: IVariant, next) {
  this.price = this.basePrice + (this.basePrice * this.gstRate) / 100;

  const isDiscountValid =
    this.hasDiscount &&
    this.discountPercent > 0 &&
    (!this.discountValidUntil || this.discountValidUntil > new Date());

  if (isDiscountValid) {
    const discountAmount = (this.basePrice * this.discountPercent) / 100;
    const discountedBasePrice = this.basePrice - discountAmount;

    this.discountedPrice =
      discountedBasePrice + (discountedBasePrice * this.gstRate) / 100;
    this.savings = this.price - this.discountedPrice;
  } else {
    this.discountedPrice = this.price;
    this.savings = 0;
    this.hasDiscount = false;
  }

  this.price = Math.round(this.price * 100) / 100;
  this.discountedPrice = Math.round(this.discountedPrice * 100) / 100;
  this.savings = Math.round(this.savings * 100) / 100;

  next();
});

// Product Interface
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

  price: number; // Lowest variant price
  lowestDiscountedPrice: number; // Lowest discounted price among variants
  maxSavings: number;

  createdBy: Types.ObjectId;
  createdAt: Date;
  isPublished: boolean;

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

  reviewSettings: {
    allowReviews: boolean;
    requireVerification: boolean;
    autoApprove: boolean;
  };
}

// Static methods interface
interface IProductModel extends Model<IProduct> {
  updateReviewStats(productId: string, stats: any): Promise<IProduct | null>;
  getByRatingRange(minRating: number, maxRating?: number): Promise<IProduct[]>;
  getTopRated(limit?: number): Promise<IProduct[]>;
}

// Product Schema
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
    price: { type: Number, required: true },
    lowestDiscountedPrice: { type: Number, required: false },
    maxSavings: { type: Number, default: 0 },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isPublished: { type: Boolean, default: false },
    reviewStats: {
      averageRating: { type: Number, default: 0, min: 0, max: 5 },
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

// Pre-save hook for slug and price aggregation including discount
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      remove: /[\*+\~.()'"!:@]/g,
    });
  }
  if (this.variants && this.variants.length) {
    this.price = Math.min(...this.variants.map((v) => v.price ?? 0));
    this.lowestDiscountedPrice = Math.min(
      ...this.variants.map((v) => v.discountedPrice ?? 0)
    );
    this.maxSavings = Math.max(...this.variants.map((v) => v.savings ?? 0));

    this.colors = [...new Set(this.variants.map((v) => v.color))];
    this.sizes = [...new Set(this.variants.map((v) => v.size))];
  }

  next();
});

// Virtual fields
// productSchema.virtual("totalStock").get(function (this: IProduct) {
//   return this.variants.reduce((sum, v) => sum + v.stock, 0);
// });

// productSchema.virtual("inStock").get(function (this: IProduct) {
//   return this.variants.some((v) => v.stock > 0);
// });

// productSchema.virtual("hasAnyDiscount").get(function (this: IProduct) {
//   return this.variants.some((v) => v.hasDiscount);
// });

// productSchema.virtual("totalSavings").get(function (this: IProduct) {
//   return this.variants.reduce((sum, v) => sum + (v.savings ?? 0), 0);
// });

// Indexes for performance
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ lowestDiscountedPrice: 1 });
productSchema.index({ maxSavings: -1 });
productSchema.index({ isPublished: 1 });
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

// Additional Utility Methods
productSchema.statics.getInStockProducts = function () {
  return this.find({
    "variants.stock": { $gt: 0 },
    isPublished: true,
  });
};

productSchema.statics.getLowStockProducts = function (threshold: number = 10) {
  return this.aggregate([
    { $unwind: "$variants" },
    { $match: { "variants.stock": { $lte: threshold }, isPublished: true } },
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        lowStockVariants: { $push: "$variants" },
        totalLowStockItems: { $sum: "$variants.stock" },
      },
    },
  ]);
};

// Export model
let Product: IProductModel;
if (models.Product) {
  Product = models.Product as IProductModel;
} else {
  Product = model<IProduct, IProductModel>("Product", productSchema);
}

export default Product;
