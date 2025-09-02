// Base shared structure
export type Variant = {
  _id?: string;
  color: string;
  size: string;
  gstRate: number;
  stock: number;
  images: {
    url: string;
    public_id: string;
  }[];
  price?: number;
  hasDiscount: boolean;
  discountPercent: number;
  discountValidUntil?: string; // ISO date string from API
  discountedPrice: number; // Final price after discount
  savings?: number; // Amount saved
};

export type BaseProduct = {
  _id: string;
  name: string;
  title: string;
  description: string;
  variants: Variant[];
  specifications?: Specification[];
  measurements?: {
    width?: number;
    height?: number;
    depth?: number;
    weight?: number;
  };
  isPublished: boolean;
  warranty?: string;
  disclaimer?: string;
 slug: string;
  // ✅ Pricing fields (existing)
  price?: number; // Lowest original price

  // ✅ NEW: Product-level discount info
  lowestDiscountedPrice?: number; // Best discounted price
  maxSavings?: number; // Maximum savings across variants

  // ✅ NEW: Computed discount info (from virtuals)
  hasAnyDiscount?: boolean; // Any variant has discount
  maxDiscountPercent?: number; // Highest discount percentage
  activeDiscountsCount?: number; // Number of variants with active discounts
  totalStock?: number; // Total stock across variants
  inStock?: boolean; // Has any stock
};

// Input/Create: used when sending data (category is just ID)
export type Product = BaseProduct & {
  category: string; // just the ID
};

// Display/View: used when receiving data (category is populated)
export type DisplayProduct = BaseProduct & {
  category: {
    _id: string;
    name: string;
  };
};

// Variant & Specification stay as-is

export type Specification = {
  section: string;
  specs: {
    key: string;
    value: string;
  }[];
};

// Response types
export type AdminProductResponse = {
  products: DisplayProduct[];
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
};

export type UserProductResponse = {
  products: DisplayProduct[];
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
};

// export interface ProductFilters {
//   category?: string;           // Category slug for filtering
//   search?: string;            // Search term
//   minPrice?: number;          // Price range filter
//   maxPrice?: number;
//   inStockOnly?: boolean;      // Show only in-stock products
//   hasDiscount?: boolean;      // Show only discounted products
//   brands?: string[];          // Multiple brand filter (future)
//   colors?: string[];          // Color filter (future)
//   sizes?: string[];           // Size filter (future)
// }

// export interface ProductSortOptions {
//   sortBy?: 'priceAsc' | 'priceDesc' | 'newest' | 'oldest' | 'popularity' | 'discount';
//   orderBy?: 'asc' | 'desc';
// }

// // ==================== QUERY PARAMETERS TYPES ====================

// export interface PaginationParams {
//   page?: number;
//   limit?: number;
// }

// export interface ProductQueryParams extends PaginationParams {
//   filter?: ProductFilters;
//   sort?: ProductSortOptions;
// }

//for now just for category then we will use abouve one only 
export interface ProductQueryParams {
  page?: number;
  limit?: number;
  filter?: {
    category?: string;  // ✅ Just category for now
  };
}