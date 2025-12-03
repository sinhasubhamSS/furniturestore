// types/product.ts

// Basic product shown on home / list
export type homeProduct = {
  _id: string;
  name: string;
  slug: string;
  image?: string; // representative image url (repThumbSafe/repImage)
  price?: number;
  discountedPrice?: number;
};

// Variant image
export type VariantImage = {
  url: string;
  public_id: string;
  thumbSafe?: string; // low-quality safe thumbnail
  isPrimary?: boolean;
};

// Variant shape used in frontend forms & API
export type Variant = {
  _id?: string;
  sku?: string;
  color: string;
  size: string;
  gstRate: number;
  stock: number;
  reservedStock?: number;
  images: VariantImage[];
  basePrice?: number; // original price before tax/discount (may be present)
  price?: number; // computed price (basePrice + gst)
  hasDiscount: boolean;
  discountPercent: number;
  discountValidUntil?: string | Date; // API may return ISO string or Date
  discountedPrice?: number; // price after discount
  savings?: number;
};

// Specification
export type Specification = {
  section: string;
  specs: { key: string; value: string }[];
};

// Base product shared fields
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

  // pricing (top-level aggregates)
  price?: number; // lowest variant price (original)
  lowestDiscountedPrice?: number;
  maxSavings?: number;

  // computed/virtual fields
  hasAnyDiscount?: boolean;
  maxDiscountPercent?: number;
  activeDiscountsCount?: number;
  totalStock?: number;
  inStock?: boolean;

  // representative (denormalized) snapshot fields for fast listing
  image?: string; // top-level canonical representative image (frontend-authoritative)
  repImage?: string; // full image url (may be repThumbSafe or repImage)
  repImagePublicId?: string;
  repThumbSafe?: string; // low-quality safe thumb for list
  repPrice?: number;
  repDiscountedPrice?: number;
  repSavings?: number;
  repInStock?: boolean;

  // optional admin/meta fields
  primaryVariantId?: string;
  primaryLocked?: boolean;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  ogImage?: string;
  searchTags?: string[];
  visibleOnHomepage?: boolean;

  // timestamps / creator
  createdAt?: string | Date;
  updatedAt?: string | Date;
  createdBy?: string; // user id
};

// product shape when sending to create (category as ID)
export type ProductInput = Partial<BaseProduct> & {
  name: string;
  description: string;
  category: string; // category id
  variants: Variant[];
};

// product shape returned from API with category populated
export type DisplayProduct = BaseProduct & {
  category?:
    | {
        _id: string;
        name: string;
      }
    | string; // some endpoints may return id string instead of object
};
export type Product = BaseProduct;
// Admin listing response
export type AdminProductResponse = {
  products: DisplayProduct[];
  totalItems: number;
  totalPages: number;
  page: number;
  limit: number;
};

// User listing response
export type UserProductResponse = AdminProductResponse;

// query params type
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
