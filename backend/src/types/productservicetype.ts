// 1. Updated Interfaces (product.interface.ts)
import { Types } from "mongoose";

export interface IVariant {
  sku: string; 
  color: string; // Made required
  size: string; // Made required
  basePrice: number;
  gstRate: number;
  price: number; // Final calculated price
  stock: number; // Made required
  images: {
    url: string;
    public_id: string;
  }[];
}

export interface IProductInput {
  name: string;
  slug?: string; // Will be generated
  title: string;
  description: string;
  variants: IVariant[]; // Made required

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
  stock?: number; // Computed total stock
  colors?: string[]; // Computed from variants
  sizes?: string[]; // Computed from variants

  createdBy: Types.ObjectId;
  createdAt?: Date;
  isPublished?: boolean;
}
