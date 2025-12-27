// product.model.ts
import { Schema, model, Model, models, Document, Types } from "mongoose";
import slugify from "slugify";
import { computeVariantFromBase, PricingResult } from "../utils/pricing";

/* ---------- Variant image ---------- */
export interface IVariantImage {
  url: string;
  public_id: string;
  thumbSafe?: string;
  isPrimary?: boolean;
}

/* ---------- Variant interface ---------- */
export interface IVariant extends Document {
  sku: string;
  color: string;
  size?: string;

  // SOURCE OF TRUTH
  basePrice: number; // taxable value
  gstRate: number; // %

  // computed
  gstAmount: number;
  sellingPrice: number; // base + gst
  listingPrice?: number; // optional MRP

  savings: number;
  discountPercent: number;
  hasDiscount: boolean;

  stock: number;
  reservedStock: number;
  images: IVariantImage[];

  priceUpdatedAt?: Date;
  priceUpdatedBy?: Types.ObjectId;
}

/* ---------- Product interface ---------- */
export interface IProduct extends Document {
  name: string;
  slug: string;
  title: string;
  description: string;

  variants: Types.DocumentArray<IVariant>;
  category: Types.ObjectId;

  measurements?: {
    width?: number;
    height?: number;
    depth?: number;
    weight?: number;
  };

  // denormalized
  lowestSellingPrice?: number;
  maxSavings: number;
  maxDiscountPercent?: number;
  primaryVariantId?: Types.ObjectId;
  primaryLocked?: boolean;

  repImage?: string;
  repThumbSafe?: string;
  repSellingPrice?: number;
  repListingPrice?: number;

  repInStock?: boolean;

  totalStock?: number;
  inStock?: boolean;

  createdBy: Types.ObjectId;
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

/* ---------- Model statics ---------- */
interface IProductModel extends Model<IProduct> {
  pickRepresentative(doc: any): any | null;
  recomputeDenorm(productDoc: any): Promise<IProduct | null>;

  // 🔥 ADD THIS
  updateReviewStats(
    productId: string,
    stats: {
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
    }
  ): Promise<IProduct | null>;
}

/* ---------- Schemas ---------- */
const variantImageSchema = new Schema<IVariantImage>(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
    thumbSafe: String,
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const variantSchema = new Schema<IVariant>(
  {
    sku: { type: String, required: true },
    color: { type: String, required: true },
    size: String,

    basePrice: { type: Number, required: true },
    gstRate: { type: Number, required: true, min: 0, max: 100 },

    listingPrice: Number,

    gstAmount: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },

    savings: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    hasDiscount: { type: Boolean, default: false },

    stock: { type: Number, default: 0 },
    reservedStock: { type: Number, default: 0 },

    images: { type: [variantImageSchema], default: [] },

    priceUpdatedAt: Date,
    priceUpdatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { _id: true }
);

/* ---------- Variant pre-save ---------- */
variantSchema.pre("save", function (this: any, next) {
  try {
    const pricing: PricingResult = computeVariantFromBase(
      this.basePrice,
      this.gstRate,
      this.listingPrice
    );

    this.basePrice = pricing.base;
    this.gstAmount = pricing.gstAmount;
    this.sellingPrice = pricing.sellingPrice;
    this.listingPrice = pricing.listingPrice;

    this.savings = pricing.savings;
    this.discountPercent = pricing.discountPercent;
    this.hasDiscount = pricing.savings > 0;

    this.priceUpdatedAt = new Date();
  } catch (err) {
    return next(err as any);
  }

  next();
});

/* ---------- Product schema ---------- */
const productSchema = new Schema<IProduct, IProductModel>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true },

    title: { type: String, required: true },
    description: { type: String, required: true },

    variants: { type: [variantSchema], required: true },

    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },

    lowestSellingPrice: Number,
    maxSavings: { type: Number, default: 0 },
    maxDiscountPercent: { type: Number, default: 0 },

    primaryVariantId: Schema.Types.ObjectId,
    primaryLocked: { type: Boolean, default: false },

    repImage: String,
    repThumbSafe: String,
    repSellingPrice: {
      type: Number,
    },
    repListingPrice: Number,

    repInStock: Boolean,

    totalStock: { type: Number, default: 0 },
    inStock: { type: Boolean, default: false },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isPublished: { type: Boolean, default: false },

    reviewStats: {
      averageRating: { type: Number, default: 0 },
      totalReviews: { type: Number, default: 0 },
      ratingDistribution: {
        5: { type: Number, default: 0 },
        4: { type: Number, default: 0 },
        3: { type: Number, default: 0 },
        2: { type: Number, default: 0 },
        1: { type: Number, default: 0 },
      },
      verifiedReviews: { type: Number, default: 0 },
      reviewsWithImages: { type: Number, default: 0 },
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

/* ---------- Product pre-save ---------- */
productSchema.pre("save", function (this: any, next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  if (this.variants?.length) {
    const sellingPrices = this.variants.map(
      (v: any) => v.sellingPrice || Infinity
    );
    this.lowestSellingPrice = Math.min(...sellingPrices);

    this.maxSavings = Math.max(
      ...this.variants.map((v: any) => v.savings || 0),
      0
    );
  }

  next();
});

/* ---------- statics ---------- */

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

productSchema.statics.getTopRated = function (limit: number = 10) {
  return this.find({
    "reviewStats.totalReviews": { $gte: 5 },
    isPublished: true,
  })
    .sort({ "reviewStats.averageRating": -1, "reviewStats.totalReviews": -1 })
    .limit(limit);
};
productSchema.statics.pickRepresentative = function (doc: any) {
  const variants = doc.variants || [];
  const sorted = variants
    .filter((v: any) => v.stock > 0)
    .sort((a: any, b: any) => a.sellingPrice - b.sellingPrice);

  const v = sorted[0] || variants[0];
  if (!v) return null;

  const img = v.images?.find((i: any) => i.isPrimary) || v.images?.[0];

  return {
    vid: v._id,
    img,
    sellingPrice: v.sellingPrice,
    listingPrice: v.listingPrice,
    inStock: v.stock > 0,
  };
};

productSchema.statics.recomputeDenorm = async function (productDoc: any) {
  const Product = this;
  const doc = productDoc.toObject
    ? productDoc
    : await Product.findById(productDoc);
  if (!doc) return null;

  const totalStock = doc.variants.reduce(
    (s: number, v: any) => s + Math.max(0, v.stock - v.reservedStock),
    0
  );
  const maxDiscountPercent = Math.max(
    ...doc.variants.map((v: any) => v.discountPercent || 0),
    0
  );

  const rep = Product.pickRepresentative(doc);

  return Product.findByIdAndUpdate(
    doc._id,
    {
      totalStock,
      inStock: totalStock > 0,
      primaryVariantId: rep?.vid,
      repSellingPrice: rep?.sellingPrice,
      repListingPrice: rep?.listingPrice,

      repInStock: rep?.inStock,
      repImage: rep?.img?.url,
      repThumbSafe: rep?.img?.thumbSafe,
      maxDiscountPercent,
    },
    { new: true }
  );
};

/* ---------- export ---------- */
let Product: IProductModel;
Product = models.Product
  ? (models.Product as IProductModel)
  : model<IProduct, IProductModel>("Product", productSchema);

export default Product;
