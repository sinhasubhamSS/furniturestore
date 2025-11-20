import { Schema, model, Model, models, Document, Types } from "mongoose";
import slugify from "slugify";

/* ---------- Variant image + variant interfaces ---------- */
export interface IVariantImage {
  url: string;
  public_id: string;
  thumbSafe?: string;
  blurDataURL?: string;
  isPrimary?: boolean;
}

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
  images: IVariantImage[];
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

  colors: string[];
  sizes: string[];

  warranty?: string;
  disclaimer?: string;

  category: Types.ObjectId;

  price: number; // Lowest variant price
  lowestDiscountedPrice?: number; // Lowest discounted price among variants
  maxSavings: number;

  // denorm + SEO
  primaryVariantId?: Types.ObjectId;
  primaryLocked?: boolean;

  repImage?: string;
  repImagePublicId?: string;
  repThumbSafe?: string;
  repBlurDataURL?: string;

  repPrice?: number;
  repDiscountedPrice?: number;
  repSavings?: number;
  repInStock?: boolean;

  totalStock?: number;
  inStock?: boolean;

  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  searchTags?: string[];
  visibleOnHomepage?: boolean;
  lastUpdatedForListing?: Date;

  // timestamps
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
    blurDataURL: { type: String },
    isPrimary: { type: Boolean, default: false },
  },
  { _id: false }
);

const variantSchema = new Schema<IVariant>(
  {
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

    images: { type: [variantImageSchema], default: [] },
  },
  { _id: true }
);

/* ---------- variant pre-save ---------- */
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

/* ---------- Product schema ---------- */
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

    // denorm + seo
    primaryVariantId: { type: Schema.Types.ObjectId },
    primaryLocked: { type: Boolean, default: false },

    repImage: { type: String },
    repImagePublicId: { type: String },
    repThumbSafe: { type: String },
    repBlurDataURL: { type: String },

    repPrice: { type: Number },
    repDiscountedPrice: { type: Number },
    repSavings: { type: Number, default: 0 },
    repInStock: { type: Boolean, default: false },

    totalStock: { type: Number, default: 0 },
    inStock: { type: Boolean, default: false },

    metaTitle: { type: String },
    metaDescription: { type: String },
    canonicalUrl: { type: String },
    ogImage: { type: String },

    searchTags: { type: [String], default: [] },
    visibleOnHomepage: { type: Boolean, default: false },

    lastUpdatedForListing: { type: Date, default: Date.now },

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
productSchema.pre("save", function (this: IProduct, next) {
  // slugify if name changed
  if (this.isModified("name")) {
    this.slug = slugify(this.name, {
      lower: true,
      strict: true,
      remove: /[\*+\~.()'"!:@]/g,
    });
  }

  // aggregates
  if (this.variants && this.variants.length) {
    this.price =
      Math.min(...this.variants.map((v: any) => v.price ?? Infinity)) ||
      this.price;
    this.lowestDiscountedPrice =
      Math.min(
        ...this.variants.map((v: any) => v.discountedPrice ?? Infinity)
      ) || this.lowestDiscountedPrice;
    this.maxSavings = Math.max(
      ...this.variants.map((v: any) => v.savings ?? 0),
      this.maxSavings
    );

    this.colors = [...new Set(this.variants.map((v: any) => v.color))];
    this.sizes = [...new Set(this.variants.map((v: any) => v.size))];
  }

  // sync representative variant snapshot so listing price/image match chosen variant
  try {
    const Model: any = (this.constructor as any);
    const pickFn = typeof Model.pickRepresentative === "function" ? Model.pickRepresentative : null;
    let rep: any = null;

    if (pickFn) {
      rep = pickFn(this);
    } else {
      // fallback to first variant
      const v0 = this.variants?.[0];
      if (v0) {
        const img = (v0.images && v0.images.find((i: any) => i.isPrimary)) || v0.images?.[0] || {};
        rep = {
          vid: v0._id,
          img,
          price: v0.price,
          discountedPrice: v0.discountedPrice,
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
      this.repSavings = rep.savings || 0;
      this.repInStock = !!rep.inStock;

      if (rep.img) {
        // prefer existing top-level values if already set (admin override)
        this.repImage = this.repImage || rep.img.url;
        this.repImagePublicId = this.repImagePublicId || rep.img.public_id;
        this.repThumbSafe = this.repThumbSafe || rep.img.thumbSafe;
        this.repBlurDataURL = this.repBlurDataURL || rep.img.blurDataURL;
        this.ogImage = this.ogImage || rep.img.thumbSafe || rep.img.url;
      }
    }
  } catch (e) {
    // ignore errors and continue save
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

// pickRepresentative: admin override respected; otherwise choose best in-stock then lowest discounted price
productSchema.statics.pickRepresentative = function (doc: any) {
  if (!doc) return null;

  // if admin locked primaryVariant, prefer that exact variant (even if OOS)
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
        price: v.price,
        discountedPrice: v.discountedPrice,
        savings: v.savings,
        inStock: (v.stock || 0) > 0,
      };
    }
  }

  // otherwise choose automatically preferring inStock variants then lowest discountedPrice + savings
  const arr = (doc.variants || []).map((v: any) => ({
    v,
    score:
      ((v.stock || 0) > 0 ? 10000 : 0) -
      (v.discountedPrice || v.price || 0) +
      (v.savings || 0),
  }));
  arr.sort((a: any, b: any) => b.score - a.score);
  const best = arr[0]?.v;
  if (!best) return null;
  const firstImg =
    (best.images && best.images.find((i: any) => i.isPrimary)) ||
    best.images?.[0] ||
    {};
  return {
    vid: best._id,
    img: firstImg,
    price: best.price,
    discountedPrice: best.discountedPrice,
    savings: best.savings,
    inStock: (best.stock || 0) > 0,
  };
};

// recomputeDenorm: update denorm fields, respects primaryLocked
productSchema.statics.recomputeDenorm = async function (productDoc: any) {
  const Product = this;
  let doc = productDoc;
  if (!productDoc.toObject) doc = await Product.findById(productDoc);
  if (!doc) return null;

  // compute totalStock accounting reservedStock
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
    lastUpdatedForListing: new Date(),
  };

  if (rep) {
    // if admin locked primaryVariant, we should not overwrite primaryVariantId
    if (!doc.primaryLocked) update.primaryVariantId = rep.vid;
    // always update representative snapshot fields
    update.repPrice = rep.price;
    update.repDiscountedPrice = rep.discountedPrice;
    update.repSavings = rep.savings || 0;
    update.repInStock = rep.inStock;

    if (rep.img) {
      update.repImage = rep.img.url || update.repImage;
      update.repImagePublicId = rep.img.public_id || update.repImagePublicId;
      update.repThumbSafe = rep.img.thumbSafe || update.repThumbSafe;
      update.repBlurDataURL = rep.img.blurDataURL || update.repBlurDataURL;
      update.ogImage = update.ogImage || rep.img.thumbSafe || rep.img.url;
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
