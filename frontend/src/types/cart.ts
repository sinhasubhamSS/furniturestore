import { DeliveryInfo } from "./delivery";
import { DisplayProduct } from "./Product";

export type CartItem = {
  productId: string;           // Backend ObjectId as string
  variantId: string;           // Variant Id as string
  quantity: number;
  addedAt?: Date | string;

  // Ye fields optional rakhni chahiye kyunki ye populated data se aate hain
  product?: DisplayProduct;
  name?: string;
  image?: string;
  price?: number;
  hasDiscount?: boolean;
  discountPercent?: number;
  color?: string;
  size?: string;
  stock?: number;
  weight?: number;
  title?: string;
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
