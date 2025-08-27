// types/cart.ts - ✅ Updated to match new backend structure
import { DeliveryInfo } from "./delivery";
import { DisplayProduct } from "./Product";

export type CartItem = {
  productId: string;
  product: DisplayProduct;
  variantId: string;
  quantity: number;
  addedAt?: Date;
  // ✅ For local cart state management
  name: string;
  image: string;
  price: number;
  hasDiscount: boolean;
  discountPercent?: number;
  color: string;
  size: string;
  stock: number;
  weight: number;
};

export type CartResponse = {
  _id: string | null;
  user: string;
  items: CartItem[];
  totalItems: number;
  cartSubtotal: number;
  cartGST: number;
  cartTotal: number;
  createdAt?: Date;
  updatedAt?: Date;
};
export interface CartState {
  items: CartItem[];
  totalItems: number;
  cartSubtotal: number;
  cartGST: number;
  cartTotal: number;
  totalWeight: number;
  deliveryCharges: number;
  finalTotal: number;
  syncing: boolean;
  deliveryInfo: DeliveryInfo | null;
}
