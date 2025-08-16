// 1. Updated Interfaces (product.interface.ts)
import { Types } from "mongoose";

export interface IVariant {
  sku?: string;
  color: string;
  size: string;
  basePrice: number;
  gstRate: number;

  // Calculated pricing fields - OPTIONAL करें
  price?: number; // Optional, pre-save में कैलकुलेट
  discountedPrice?: number; // Optional, pre-save में कैलकुलेट
  savings?: number; // Optional, pre-save में कैलकुलेट

  hasDiscount: boolean;
  discountPercent: number;
  discountValidUntil?: Date;

  stock: number;
  images: {
    url: string;
    public_id: string; // Fixed underscore notation
  }[];
}

export interface IProductInput {
  name: string;
  slug?: string; // Auto-generated
  title: string;
  description: string;
  variants: IVariant[]; // Required

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
  price?: number; // Computed min price
  colors?: string[]; // Computed from variants
  sizes?: string[]; // Computed from variants
  lowestDiscountedPrice?: number;
  maxSavings?: number;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  isPublished?: boolean;
}
