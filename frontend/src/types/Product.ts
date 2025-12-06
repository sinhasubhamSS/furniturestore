// types/product.ts
// Frontend TypeScript types for product & variants.
// These intentionally include both modern field names (listingPrice/sellingPrice)
// and legacy compatibility fields (price/discountedPrice) to avoid breaking older code.

/**
 * Basic product shown on home / list
 */
export type homeProduct = {
  _id: string;
  name: string;
  slug: string;
  image?: string; // representative image url (repThumbSafe/repImage)
  // legacy listing / selling fields for quick listing compatibility
  price?: number; // legacy listing price (lowest listing)
  discountedPrice?: number; // legacy selling price (lowest selling)
};

/**
 * Variant image
 */
export type VariantImage = {
  url: string;
  public_id: string;
  thumbSafe?: string; // low-quality safe thumbnail
  isPrimary?: boolean;
};

/**
 * Variant shape used in frontend forms & API
 */
export type Variant = {
  _id?: string;
  sku?: string;
  color: string;
  size?: string;

  // SOURCE OF TRUTH (backend persists these)
  basePrice?: number; // taxable value (before GST) — canonical internal
  gstRate?: number; // percent, e.g. 18
  gstAmount?: number; // computed GST amount (internal)

  // Marketing vs final:
  listingPrice?: number; // marketing MRP (display - strike-through)
  sellingPrice?: number; // final customer pays (includes GST)

  // Optional merchant-input field (input-only). If you support merchant sending final price,
  // you can accept this in API payload and backend will derive basePrice from it.
  // Not persisted in canonical model unless you intentionally store it.
  finalSellingPrice?: number;

  stock: number;
  reservedStock?: number;

  images: VariantImage[];

  // legacy/compat (kept in many places)
  price?: number; // legacy listingPrice for older code
  discountedPrice?: number; // legacy sellingPrice for older code
  savings?: number; // listingPrice - sellingPrice

  // discount display fields
  hasDiscount?: boolean;
  discountPercent?: number; // rounded integer percent for "XX% off"
  discountValidUntil?: string | Date;

  // audit / meta (optional)
  priceMode?: "base" | "selling";
  priceUpdatedAt?: string | Date;
  priceUpdatedBy?: string;
};

/**
 * Specification
 */
export type Specification = {
  section: string;
  specs: { key: string; value: string }[];
};

/**
 * Base product shared fields
 */
export type BaseProduct = {
  _id: string;
  name: string;
  title?: string;
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

  // pricing (top-level aggregates) - denormalized for listing performance
  price?: number; // lowest listingPrice among variants (legacy/marketing)
  lowestDiscountedPrice?: number; // lowest sellingPrice among variants (final)
  maxSavings?: number;

  // denormalized representative snapshot (for fast listing)
  image?: string; // top-level canonical representative image (frontend)
  repImage?: string; // full image url (may be repThumbSafe or repImage)
  repThumbSafe?: string; // low-quality safe thumb for list
  repPrice?: number; // denormalized listingPrice (for fast listing)
  repDiscountedPrice?: number; // denormalized sellingPrice (for fast listing)
  repSavings?: number;
  repInStock?: boolean;

  // stock / availability denorms (add these so frontend can safely read them)
  totalStock?: number;
  inStock?: boolean;

  // optional admin/meta fields
  primaryVariantId?: string;
  primaryLocked?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  searchTags?: string[];
  visibleOnHomepage?: boolean;

  // timestamps / creator
  createdAt?: string | Date;
  updatedAt?: string | Date;
  createdBy?: string;
};

/**
 * DisplayProduct extends BaseProduct with category info (id+name or slug)
 */
export type DisplayProduct = BaseProduct & {
  category?:
    | {
        _id: string;
        name: string;
      }
    | string;
};
export type AdminProductResponse = {
  products: DisplayProduct[]; // product list
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
};
export interface ProductQueryParams {
  page?: number;
  limit?: number;
  filter?: {
    category?: string; // slug or id
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    hasDiscount?: boolean;
  };
  sortBy?: "latest" | "price_low" | "price_high" | "discount";
  fields?: string | string[];
}
export type UserProductResponse = {
  products: DisplayProduct[];
  page: number;
  limit: number;
  totalPages: number;
  totalItems: number;
};
export type Product = BaseProduct;
