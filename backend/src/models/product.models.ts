// product.model.ts
import { Schema, model, Model, models, Document, Types } from "mongoose";
import slugify from "slugify";
import {
  computeVariantFromBase,
  computeVariantFromSellingPrice,
  PricingResult,
} from "../utils/pricing";

/* =====================================================
   Variant Image
===================================================== */
export interface IVariantImage {
  url: string;
  public_id: string;
  thumbSafe?: string;
  isPrimary?: boolean;
}

/* =====================================================
   Variant (SOURCE OF TRUTH FOR PRICE)
===================================================== */
export interface IVariant extends Document {
  sku: string;
  color: string;
  size?: string;

  basePrice: number; // taxable
  gstRate: number; // %
  gstAmount: number;

  sellingPrice: number; // ✅ FINAL PAYABLE (GST included)
  listingPrice?: number; // ✅ MRP (cut)

  savings: number;
  discountPercent: number;
  hasDiscount: boolean;
  discountValidUntil?: Date;

  finalSellingPrice?: number; // input-only (merchant UX)

  stock: number;
  reservedStock: number;
  images: IVariantImage[];

  priceMode?: "base" | "selling";
  priceUpdatedAt?: Date;
  priceUpdatedBy?: Types.ObjectId;
}

/* =====================================================
   Product
===================================================== */
export interface IProduct extends Document {
  name: string;
  slug: string;

  title: string;
  description: string;
  category: Types.ObjectId;

  variants: Types.DocumentArray<IVariant>;

  // 🔹 DENORMALIZED SNAPSHOTS (READ-ONLY)
  price?: number; // lowest listingPrice
  lowestDiscountedPrice?: number; // lowest sellingPrice
  maxSavings: number;

  repPrice?: number; // listingPrice of rep variant
  repDiscountedPrice?: number; // sellingPrice of rep variant
  repImage?: string;
  repThumbSafe?: string;
  repInStock?: boolean;

  totalStock?: number;
  inStock?: boolean;

  primaryVariantId?: Types.ObjectId;
  primaryLocked?: boolean;

  createdBy: Types.ObjectId;
  isPublished: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}

/* =====================================================
   Variant Schema
===================================================== */
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

    gstAmount: { type: Number, default: 0 },
    sellingPrice: { type: Number, default: 0 },
    listingPrice: { type: Number },

    finalSellingPrice: { type: Number },

    savings: { type: Number, default: 0 },
    discountPercent: { type: Number, default: 0 },
    hasDiscount: { type: Boolean, default: false },
    discountValidUntil: Date,

    stock: { type: Number, default: 0 },
    reservedStock: { type: Number, default: 0 },

    images: { type: [variantImageSchema], default: [] },

    priceMode: { type: String, enum: ["base", "selling"], default: "base" },
    priceUpdatedAt: Date,
    priceUpdatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { _id: true }
);

/* =====================================================
   Variant Pricing Hook
===================================================== */
variantSchema.pre("save", function (next) {
  try {
    let pricing: PricingResult;

    const gstRate = this.gstRate || 0;
    const listingInput =
      typeof this.listingPrice === "number" && this.listingPrice > 0
        ? this.listingPrice
        : undefined;

    if (this.finalSellingPrice && this.finalSellingPrice > 0) {
      pricing = computeVariantFromSellingPrice(
        this.finalSellingPrice,
        gstRate,
        listingInput
      );
      this.basePrice = pricing.base;
      this.priceMode = "selling";
      this.finalSellingPrice = undefined;
    } else {
      pricing = computeVariantFromBase(this.basePrice, gstRate, listingInput);
      this.priceMode = "base";
    }

    this.gstAmount = pricing.gstAmount;
    this.sellingPrice = pricing.sellingPrice;
    this.listingPrice = pricing.listingPrice;

    this.savings = pricing.savings;
    this.discountPercent = pricing.discountPercent;
    this.hasDiscount = pricing.savings > 0;

    this.priceUpdatedAt = new Date();
  } catch (e) {
    // fail-safe (never crash save)
  }
  next();
});

/* =====================================================
   Product Schema
===================================================== */
const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },

    title: { type: String, required: true },
    description: { type: String, required: true },

    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },

    variants: { type: [variantSchema], required: true },

    price: Number,
    lowestDiscountedPrice: Number,
    maxSavings: { type: Number, default: 0 },

    repPrice: Number,
    repDiscountedPrice: Number,
    repImage: String,
    repThumbSafe: String,
    repInStock: Boolean,

    totalStock: Number,
    inStock: Boolean,

    primaryVariantId: Schema.Types.ObjectId,
    primaryLocked: { type: Boolean, default: false },

    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

/* =====================================================
   Product Pre-save (slug + denorm)
===================================================== */
productSchema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }

  if (this.variants?.length) {
    const listing = this.variants.map((v) => v.listingPrice ?? Infinity);
    const selling = this.variants.map((v) => v.sellingPrice ?? Infinity);

    this.price = Math.min(...listing);
    this.lowestDiscountedPrice = Math.min(...selling);
    this.maxSavings = Math.max(...this.variants.map((v) => v.savings));

    const rep =
      this.variants.find(
        (v) => String(v._id) === String(this.primaryVariantId)
      ) || this.variants[0];

    if (rep) {
      const img = rep.images.find((i) => i.isPrimary) || rep.images[0];

      this.repPrice = rep.listingPrice;
      this.repDiscountedPrice = rep.sellingPrice;
      this.repInStock = rep.stock > 0;

      if (img) {
        this.repImage = img.url;
        this.repThumbSafe = img.thumbSafe;
      }
    }

    const totalStock = this.variants.reduce(
      (s, v) => s + Math.max(0, v.stock - v.reservedStock),
      0
    );

    this.totalStock = totalStock;
    this.inStock = totalStock > 0;
  }

  next();
});

/* =====================================================
   Export
===================================================== */
export default models.Product || model<IProduct>("Product", productSchema);
