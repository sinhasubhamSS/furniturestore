import { Types } from "mongoose";

// ✅ Enhanced IVariant Interface
export interface IVariant {
  sku?: string;
  color: string;
  size: string;
  basePrice: number;
  gstRate: number;

  // ✅ Calculated pricing fields - OPTIONAL (auto-calculated)
  price?: number;
  discountedPrice?: number;
  savings?: number;

  // ✅ Discount fields with proper types
  hasDiscount: boolean;
  discountPercent: number;
  discountValidUntil?: Date | null;

  // ✅ Stock management
  stock: number;
  reservedStock?: number;

  // ✅ Images array with proper structure
  images: {
    url: string;
    public_id: string;
    thumbSafe?: string | null;
    isPrimary?: boolean;
  }[];
}

// ✅ Enhanced IProductInput Interface
export interface IProductInput {
  name: string;
  slug?: string; // Auto-generated from name
  title?: string;
  description: string;

  // ✅ Required variants array
  variants: IVariant[];

  // ✅ Optional product specifications
  specifications?: {
    section: string;
    specs: { key: string; value: string }[];
  }[];

  // ✅ Optional measurements
  measurements?: {
    width?: number;
    height?: number;
    depth?: number;
    weight?: number;
  };

  // ✅ Optional fields
  warranty?: string;
  disclaimer?: string;

  // ✅ Required category reference
  category: Types.ObjectId;

  // ✅ Auto-calculated pricing fields (computed from variants)
  price?: number; // Lowest variant price
  lowestDiscountedPrice?: number; // Lowest discounted price
  maxSavings?: number; // Maximum savings across variants

  // ✅ Auto-computed arrays (from variants)
  colors?: string[]; // Unique colors from variants
  sizes?: string[]; // Unique sizes from variants

  // ✅ Metadata fields
  createdBy: Types.ObjectId;
  createdAt?: Date;
  isPublished?: boolean;

  // ✅ Review stats (optional, with defaults in schema)
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

  // ✅ Review settings (optional, with defaults in schema)
  reviewSettings?: {
    allowReviews?: boolean;
    requireVerification?: boolean;
    autoApprove?: boolean;
  };
}

// ✅ Sort Options Type for Service
export type SortByOptions = "latest" | "price_low" | "price_high" | "discount";

// ✅ Filter Options Type for API queries
export interface IProductFilter {
  category?: string; // Category slug
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  hasDiscount?: boolean;
  isPublished?: boolean;
}

// ✅ API Response Type for getAllProducts
export interface IProductResponse {
  products: IProductInput[];
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
}
