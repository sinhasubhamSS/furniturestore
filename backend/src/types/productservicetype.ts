import { Types } from "mongoose";

/* ---------- Variant (SERVICE INPUT) ---------- */
export interface IVariant {
  sku?: string;

  // ✅ NEW: unified attributes (NO hardcoding)
  attributes?: {
    finish?: string; // walnut / teak / natural / fabric color
    size?: string; // king / queen / single
    seating?: string; // 3 seater / 5 seater
    configuration?: string; // 3+1+1 / L-shape
  };

  // SOURCE-OF-TRUTH (admin must provide)
  basePrice: number; // taxable value (before GST)
  gstRate: number; // percent (0–100)

  // optional display
  listingPrice?: number;

  // computed (filled by service / model)
  gstAmount?: number;
  sellingPrice?: number;

  // legacy compatibility (optional – safe to keep)
  price?: number;
  discountedPrice?: number;
  savings?: number;

  // discount UX
  hasDiscount?: boolean;
  discountPercent?: number;
  discountValidUntil?: Date | null;

  // stock
  stock: number;
  reservedStock?: number;

  // images
  images: {
    url: string;
    public_id: string;
    thumbSafe?: string | null;
    isPrimary?: boolean;
  }[];

  // per-variant measurement (IMPORTANT for furniture)
  measurements?: {
    length?: number;
    width?: number;
    height?: number;
    depth?: number;
    weight?: number;
  };

  // audit
  priceUpdatedAt?: Date;
  priceUpdatedBy?: Types.ObjectId | null;
}

/* ---------- Product input ---------- */
export interface IProductInput {
  name: string;
  slug?: string;
  title?: string;
  description: string;

  // variants required
  variants: IVariant[];

  specifications?: {
    section: string;
    specs: { key: string; value: string }[];
  }[];

  // ❌ product-level measurements removed (variant-level only)
  // measurements?: ❌ (INTENTIONALLY REMOVED)

  warrantyPeriod: number;
  disclaimer?: string;

  category: Types.ObjectId;

  // denormalized / derived
  price?: number;
  lowestDiscountedPrice?: number;
  maxSavings?: number;

  createdBy: Types.ObjectId;
  createdAt?: Date;
  isPublished?: boolean;

  // reviews
  reviewStats?: {
    averageRating?: number;
    totalReviews?: number;
    ratingDistribution?: {
      5: number;
      4: number;
      3: number;
      2: number;
      1: number;
    };
    verifiedReviews?: number;
    reviewsWithImages?: number;
    lastUpdated?: Date;
  };

  reviewSettings?: {
    allowReviews?: boolean;
    requireVerification?: boolean;
    autoApprove?: boolean;
  };
}

/* ---------- Helpers ---------- */
export type SortByOptions = "latest" | "price_low" | "price_high" | "discount";

export interface IProductFilter {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  hasDiscount?: boolean;
  isPublished?: boolean;
}

export interface IProductResponse {
  products: IProductInput[];
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}
