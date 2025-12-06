import { Types } from "mongoose";

/* ---------- Variant ---------- */
export interface IVariant {
  sku?: string;
  color: string;
  size?: string;

  // SOURCE-OF-TRUTH (admin must provide)
  basePrice: number; // taxable value (before GST) - required
  gstRate: number; // percent, e.g. 18

  // Optional marketing/display
  listingPrice?: number; // optional MRP shown to users

  // Computed / persisted (may be absent on input but stored on DB)
  gstAmount?: number; // computed = basePrice * gstRate/100
  sellingPrice?: number; // computed = basePrice + gstAmount

  // legacy compatibility (optional)
  price?: number; // legacy listingPrice
  discountedPrice?: number; // legacy sellingPrice
  savings?: number;

  // discounts (for display/UX only)
  hasDiscount?: boolean;
  discountPercent?: number; // 0-100
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

  // audit (optional)
  priceMode?: "base" | "selling"; // we set "base" by default
  priceUpdatedAt?: Date;
  priceUpdatedBy?: Types.ObjectId | null;
}

/* ---------- Product input ---------- */
export interface IProductInput {
  name: string;
  slug?: string; // auto-generated if absent
  title?: string;
  description: string;

  // variants required
  variants: IVariant[];

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

  warranty?: string;
  disclaimer?: string;

  category: Types.ObjectId;

  // denorm/derived (optional on input, maintained by service)
  price?: number; // lowest listingPrice (for product listing)
  lowestDiscountedPrice?: number; // lowest sellingPrice across variants
  maxSavings?: number;

  // helpful arrays (computed)
  colors?: string[];
  sizes?: string[];

  createdBy: Types.ObjectId;
  createdAt?: Date;
  isPublished?: boolean;

  // review fields (optional)
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

/* ---------- Other helpers ---------- */
export type SortByOptions = "latest" | "price_low" | "price_high" | "discount";

export interface IProductFilter {
  category?: string; // slug
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
