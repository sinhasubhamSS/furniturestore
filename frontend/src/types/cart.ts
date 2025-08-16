// types/cart.ts - ✅ Updated to match new backend structure
import { DisplayProduct } from "./Product";

export type CartItem = {
  _id?: string; // Optional for embedded items
  product: DisplayProduct; // ✅ Full product with variants
  variantId: string; // ✅ Added variant tracking
  quantity: number;
  addedAt: Date;
};

export type CartResponse = {
  _id: string | null;
  user: string;
  items: CartItem[];
  totalItems: number; // ✅ Updated field names
  cartSubtotal: number;
  cartGST: number;
  cartTotal: number;
  createdAt?: Date;
  updatedAt?: Date;
};
