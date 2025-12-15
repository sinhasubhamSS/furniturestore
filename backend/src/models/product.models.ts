// product.model.ts
import { Schema, model, Model, models, Document, Types } from "mongoose";
import slugify from "slugify";
import {
  computeVariantFromBase,
  computeVariantFromSellingPrice,
  PricingResult,
} from "../utils/pricing";

/* ---------- Variant image + variant interfaces ---------- */
export interface IVariantImage {
  url: string;
  public_id: string;
  thumbSafe?: string;
  isPrimary?: boolean;
}

export interface IVariant extends Document {
  sku: string;
  color: string;
  size?: string;

  // SOURCE-OF-TRUTH (admin enters basePrice) OR derived from finalSellingPrice
  basePrice: number; // taxable value (admin must provide OR derived)
  gstRate: number; // percent e.g. 18 (0-100)

  // Optional marketing/display MRP
  listingPrice?: number;

  // Computed (persisted)
  gstAmount: number;
  sellingPrice: number; // base + gst (inclusive) OR provided as finalSellingPrice and derived

  // For merchant-friendly input: optional field that can be sent from frontend.
  // We'll delete it after computation so it doesn't stay stored.
  finalSellingPrice?: number;

  // Compatibility / snapshots (deprecated names kept)
  price?: number; // mirrors listingPrice (DEPRECATED)
  discountedPrice?: number; // mirrors sellingPrice (DEPRECATED)
  savings: number;

  discountPercent?: number; // computed from listingPrice vs sellingPrice (integer percent)

  hasDiscount?: boolean;
  discountValidUntil?: Date;

  stock: number;
  reservedStock: number;
  images: IVariantImage[];

  // audit
  priceMode?: "base" | "selling";
  priceUpdatedAt?: Date;
  priceUpdatedBy?: Types.ObjectId;
}

/* ---------- Product interface ---------- */
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

  warranty?: string;
  disclaimer?: string;

  category: Types.ObjectId;

  // Denormalized product-level aggregates
  price?: number; // lowest variant listingPrice (marketing)
  lowestDiscountedPrice?: number; // lowest variant sellingPrice (actual payable)
  maxSavings: number;

  primaryVariantId?: Types.ObjectId;
  primaryLocked?: boolean;

  repImage?: string;
  repThumbSafe?: string;

  repPrice?: number;
  repDiscountedPrice?: number;
  repInStock?: boolean;

  totalStock?: number;
  inStock?: boolean;

  displayMRP?: number;

  metaTitle?: string;
  metaDescription?: string;
  searchTags?: string[];
  visibleOnHomepage?: boolean;

  createdAt?: Date;
  updatedAt?: Date;

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
  updateReviewStats(productId: string, stats: any): Promise<IProduct | null>;
  getByRatingRange(minRating: number, maxRating?: number): Promise<IProduct[]>;
  getTopRated(limit?: number): Promise<IProduct[]>;
  pickRepresentative(doc: any): any | null;
  recomputeDenorm(productDoc: any): Promise<IProduct | null>;
}

/* ---------- Schemas ---------- */
const variantImageSchema = new Schema<IVariantImage>(
  {
    url: { type: String, required: true },
    public_id: { type: String, required: true },
    thumbSafe: { type: String },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const variantSchema = new Schema<IVariant>(
  {
    sku: { type: String, required: true },
    color: { type: String, required: true },
    size: { type: String },

    // Source-of-truth: basePrice (taxable)
    basePrice: { type: Number, required: true },
    gstRate: { type: Number, required: true, min: 0, max: 100 },

    // Optional marketing/display MRP (no default so absence is explicit)
    listingPrice: { type: Number },

    // Computed (persisted for audit & invoices)
    gstAmount: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },

    // Accept merchant input of final selling price (input-only). We'll clear it after compute.
    finalSellingPrice: { type: Number },

    // legacy compatibility fields (kept updated)
    price: { type: Number }, // will mirror listingPrice
    discountedPrice: { type: Number }, // will mirror sellingPrice
    savings: { type: Number, default: 0 },

    // computed percent discount shown to users (derived from listing vs selling)
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },

    hasDiscount: { type: Boolean, default: false },
    discountValidUntil: { type: Date },

    stock: { type: Number, required: true, default: 0 },
    reservedStock: { type: Number, default: 0 },

    images: { type: [variantImageSchema], default: [] },

    // audit
    priceMode: { type: String, enum: ["base", "selling"], default: "base" },
    priceUpdatedAt: { type: Date },
    priceUpdatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { _id: true }
);

/* ---------- variant pre-save ---------- */
variantSchema.pre("save", function (this: any, next) {
  try {
    // Priority: if finalSellingPrice provided by frontend (merchant), derive base from it.
    // Otherwise use canonical basePrice as provided.
    let pricing: PricingResult | null = null;

    const gstRate = this.gstRate || 0;
    const listingInput =
      typeof this.listingPrice === "number" && this.listingPrice > 0
        ? this.listingPrice
        : undefined;

    if (
      typeof this.finalSellingPrice === "number" &&
      this.finalSellingPrice > 0
    ) {
      // merchant provided final inclusive price
      pricing = computeVariantFromSellingPrice(
        this.finalSellingPrice,
        gstRate,
        listingInput
      );
      // persist derived base
      this.basePrice = pricing.base;
      // remove the input-only field so it doesn't stay stored (optional)
      this.finalSellingPrice = undefined;
      // indicate priceMode "selling" since merchant input final price
      this.priceMode = "selling";
    } else {
      // canonical flow: admin provided basePrice
      const baseInput = typeof this.basePrice === "number" ? this.basePrice : 0;
      pricing = computeVariantFromBase(baseInput, gstRate, listingInput);
      this.priceMode = "base";
    }

    if (!pricing) throw new Error("Pricing computation failed");

    // persist canonical computed values
    this.basePrice = pricing.base;
    this.gstAmount = pricing.gstAmount;
    this.sellingPrice = pricing.sellingPrice;
    this.listingPrice = pricing.listingPrice;

    // derived fields
    this.savings = pricing.savings;
    this.discountPercent = pricing.discountPercent;
    this.hasDiscount = (this.savings || 0) > 0;

    // legacy compatibility mirrors
    this.price = this.listingPrice;
    this.discountedPrice = this.sellingPrice;

    // audit
    this.priceUpdatedAt = new Date();

    // rounding safety (pricing already rounded but double-check)
    this.basePrice = Math.round((this.basePrice || 0) * 100) / 100;
    this.gstAmount = Math.round((this.gstAmount || 0) * 100) / 100;
    this.sellingPrice = Math.round((this.sellingPrice || 0) * 100) / 100;
    if (this.listingPrice)
      this.listingPrice = Math.round(this.listingPrice * 100) / 100;
    if (this.price) this.price = Math.round(this.price * 100) / 100;
    if (this.discountedPrice)
      this.discountedPrice = Math.round(this.discountedPrice * 100) / 100;
    this.savings = Math.round((this.savings || 0) * 100) / 100;
    this.discountPercent = Math.round(this.discountPercent || 0);
  } catch (err) {
    // fallback: attempt to compute from existing fields
    try {
      const gstDecimal = (this.gstRate || 0) / 100;
      const baseFallback = this.basePrice || 0;
      const gstAmountFallback =
        Math.round(baseFallback * gstDecimal * 100) / 100;
      const sellingFallback =
        Math.round((baseFallback + gstAmountFallback) * 100) / 100;
      this.basePrice = baseFallback;
      this.gstAmount = gstAmountFallback;
      this.sellingPrice = sellingFallback;
      this.price = this.price || sellingFallback;
      this.discountedPrice = this.discountedPrice || sellingFallback;
      this.savings =
        Math.round((this.price - this.discountedPrice) * 100) / 100;
      this.discountPercent = Math.round(
        (this.listingPrice || 0) > 0
          ? ((this.listingPrice - this.sellingPrice) /
              (this.listingPrice || 1)) *
              100
          : 0
      );
      this.priceMode = this.priceMode || "base";
      this.priceUpdatedAt = new Date();
    } catch (e) {
      // allow save to continue but values may be inconsistent
    }
  }
  next();
});

/* ---------- Product schema (same as refactor) ---------- */
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

    warranty: { type: String, default: "" },
    disclaimer: { type: String, default: "" },

    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },

    price: { type: Number }, // lowest listingPrice (marketing)
    lowestDiscountedPrice: { type: Number },
    maxSavings: { type: Number, default: 0 },

    primaryVariantId: { type: Schema.Types.ObjectId },
    primaryLocked: { type: Boolean, default: false },

    repImage: { type: String },
    repThumbSafe: { type: String },

    repPrice: { type: Number },
    repDiscountedPrice: { type: Number },
    repInStock: { type: Boolean, default: false },

    totalStock: { type: Number, default: 0 },
    inStock: { type: Boolean, default: false },

    metaTitle: { type: String },
    metaDescription: { type: String },

    searchTags: { type: [String], default: [] },
    visibleOnHomepage: { type: Boolean, default: false },

    displayMRP: { type: Number },

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

/* ---------- pre-save: slug, aggregates and sync rep from representative variant ---------- */
productSchema.pre("save", function (this: any, next) {
  // slugify if name changed
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      remove: /[\*+\~.()'"!:@]/g,
    });
  }

  // aggregates from variants
  if (this.variants && this.variants.length) {
    const listingPrices = this.variants.map((v: any) =>
      typeof v.listingPrice === "number" && v.listingPrice > 0
        ? v.listingPrice
        : Infinity
    );
    const minListing = Math.min(...listingPrices);
    this.price = isFinite(minListing)
      ? Math.round(minListing * 100) / 100
      : this.price;

    const sellingPrices = this.variants.map((v: any) =>
      typeof v.sellingPrice === "number" && v.sellingPrice > 0
        ? v.sellingPrice
        : Infinity
    );
    const minSelling = Math.min(...sellingPrices);
    this.lowestDiscountedPrice = isFinite(minSelling)
      ? Math.round(minSelling * 100) / 100
      : this.lowestDiscountedPrice;

    this.maxSavings = Math.max(
      ...this.variants.map((v: any) => v.savings ?? 0),
      this.maxSavings || 0
    );
  }

  // sync representative variant snapshot
  try {
    const Model: any = this.constructor as any;
    const pickFn =
      typeof Model.pickRepresentative === "function"
        ? Model.pickRepresentative
        : null;
    let rep: any = null;

    if (pickFn) {
      rep = pickFn(this);
    } else {
      const v0 = this.variants?.[0];
      if (v0) {
        const img =
          (v0.images && v0.images.find((i: any) => i.isPrimary)) ||
          v0.images?.[0] ||
          {};
        rep = {
          vid: v0._id,
          img,
          price: v0.listingPrice,
          discountedPrice: v0.sellingPrice,
          savings: v0.savings,
          inStock: (v0.stock || 0) > 0,
        };
      }
    }

    if (rep) {
      if (!this.primaryLocked) {
        this.primaryVariantId = rep.vid;
      }

      this.repPrice = rep.price;
      this.repDiscountedPrice = rep.discountedPrice;
      this.repInStock = !!rep.inStock;

      if (rep.img) {
        this.repImage = this.repImage || rep.img.url;
        this.repThumbSafe = this.repThumbSafe || rep.img.thumbSafe;
      }
    }
  } catch (e) {
    // ignore
  }

  next();
});

/* ---------- indexes ---------- */
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });
productSchema.index({ lowestDiscountedPrice: 1 });
productSchema.index({ maxSavings: -1 });
productSchema.index({ isPublished: 1 });
productSchema.index({ primaryVariantId: 1 });
productSchema.index({ repInStock: 1, inStock: 1 });
productSchema.index({ repPrice: 1, repDiscountedPrice: 1 });
productSchema.index({
  metaTitle: "text",
  metaDescription: "text",
  searchTags: "text",
  name: "text",
  title: "text",
});

/* ---------- statics (same as earlier refactor) ---------- */
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

// pickRepresentative: admin override respected; otherwise prefer in-stock then lowest sellingPrice
productSchema.statics.pickRepresentative = function (doc: any) {
  if (!doc) return null;

  if (doc.primaryVariantId) {
    const v = doc.variants.id(doc.primaryVariantId);
    if (v) {
      const img =
        (v.images && v.images.find((i: any) => i.isPrimary)) ||
        v.images?.[0] ||
        {};
      return {
        vid: v._id,
        img,
        price: v.listingPrice,
        discountedPrice: v.sellingPrice,
        savings: v.savings,
        inStock: (v.stock || 0) > 0,
      };
    }
  }

  const candidates = (doc.variants || []).slice();
  candidates.sort((a: any, b: any) => {
    const aIn = (a.stock || 0) > 0 ? 0 : 1;
    const bIn = (b.stock || 0) > 0 ? 0 : 1;
    if (aIn !== bIn) return aIn - bIn;

    const aPrice =
      typeof a.sellingPrice === "number"
        ? a.sellingPrice
        : Number.POSITIVE_INFINITY;
    const bPrice =
      typeof b.sellingPrice === "number"
        ? b.sellingPrice
        : Number.POSITIVE_INFINITY;
    if (aPrice !== bPrice) return aPrice - bPrice;

    const aSavings = a.savings || 0;
    const bSavings = b.savings || 0;
    return bSavings - aSavings;
  });

  const best = candidates[0];
  if (!best) return null;
  const firstImg =
    (best.images && best.images.find((i: any) => i.isPrimary)) ||
    best.images?.[0] ||
    {};
  return {
    vid: best._id,
    img: firstImg,
    price: best.listingPrice,
    discountedPrice: best.sellingPrice,
    savings: best.savings,
    inStock: (best.stock || 0) > 0,
  };
};

productSchema.statics.recomputeDenorm = async function (productDoc: any) {
  const Product = this;
  let doc = productDoc;
  if (!productDoc.toObject) doc = await Product.findById(productDoc);
  if (!doc) return null;

  const totalStock = (doc.variants || []).reduce(
    (s: number, v: any) =>
      s + Math.max(0, (v.stock || 0) - (v.reservedStock || 0)),
    0
  );
  const anyInStock = totalStock > 0;

  const rep = Product.pickRepresentative(doc);
  const update: any = {
    totalStock,
    inStock: anyInStock,
  };

  if (rep) {
    if (!doc.primaryLocked) update.primaryVariantId = rep.vid;
    update.repPrice = rep.price;
    update.repDiscountedPrice = rep.discountedPrice;
    update.repInStock = rep.inStock;

    if (rep.img) {
      update.repImage = rep.img.url || update.repImage;
      update.repThumbSafe = rep.img.thumbSafe || update.repThumbSafe;
    }
  }

  return await Product.findByIdAndUpdate(doc._id, update, { new: true });
};

/* ---------- export model ---------- */
let Product: IProductModel;
if (models.Product) {
  Product = models.Product as IProductModel;
} else {
  Product = model<IProduct, IProductModel>("Product", productSchema);
}

export default Product;
