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
  image: string;
  listingPrice: number;
  discountPercent: number;
  inStock?: boolean;
  sellingPrice: number;
  savings?: number;
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
export type VariantAttributes = {
  finish?: string; // Walnut / Teak / Natural
  size?: string; // King / Queen (bed)
  seating?: string; // 3 Seater / 5 Seater (sofa)
  configuration?: string; // 3+1+1
};
export type VariantMeasurements = {
  length?: number; // cm
  width?: number;
  height?: number;
  depth?: number;
  weight?: number; // kg
};
export type Variant = {
  _id?: string;
  sku?: string;
  attributes: VariantAttributes;

  // SOURCE OF TRUTH (backend persists these)
  basePrice?: number; // taxable value (before GST) — canonical internal
  gstRate?: number; // percent, e.g. 18
  gstAmount?: number; // computed GST amount (internal)

  // Marketing vs final:
  listingPrice: number; // marketing MRP (display - strike-through)
  sellingPrice: number; // final customer pays (includes GST)
  stock: number;
  reservedStock?: number;
  images: VariantImage[];
  measurements?: VariantMeasurements;
  // legacy/compat (kept in many places)

  savings: number; // listingPrice - sellingPrice

  // discount display fields
  hasDiscount?: boolean;
  discountPercent?: number; // rounded integer percent for "XX% off"
  discountValidUntil?: string | Date;

  // audit / meta (optional)
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
  isPublished: boolean;
  warrantyPeriod?: number;
  disclaimer?: string;
  slug: string;

  discountPercent?: number;
  maxSavings?: number;

  // denormalized representative snapshot (for fast listing)
  image?: string; // top-level canonical representative image (frontend)
  repImage?: string; // full image url (may be repThumbSafe or repImage)
  repThumbSafe?: string; // low-quality safe thumb for list
  listingPrice: number; // denormalized listingPrice (for fast listing)
  sellingPrice: number; // denormalized sellingPrice (for fast listing)
  savings?: number;
  inStock?: boolean;

  // stock / availability denorms (add these so frontend can safely read them)
  totalStock?: number;

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
export type WishlistItemType = {
  product: DisplayProduct;
  variantId: string;
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
