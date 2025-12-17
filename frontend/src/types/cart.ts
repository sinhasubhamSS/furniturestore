import { DeliveryInfo } from "./delivery";
import { Variant } from "./Product";

/* =====================================================
   CART ITEM (MATCHES BACKEND EXACTLY)
   ===================================================== */
export type CartItem = {
  quantity: number;
  addedAt?: Date | string;
  variantId: string;
  product: {
    _id: string;
    name: string;
    slug: string;

    /**
     * IMPORTANT:
     * Backend sends ONLY the selected variant
     */
    variants: Variant[]; // length = 1
  };
};

/* =====================================================
   CART API RESPONSE
   ===================================================== */
export type CartResponse = {
  items: CartItem[];

  totalItems: number;
  cartListingTotal: number;
  totalDiscount: number;
  cartTotal: number;
};

/* =====================================================
   REDUX CART STATE
   ===================================================== */
export interface CartState {
  items: CartItem[];

  totalItems: number;
  cartListingTotal: number;
  totalDiscount: number;
  cartTotal: number;

  syncing: boolean;
  deliveryInfo: DeliveryInfo | null;
}
export type CheckoutItem = {
  quantity: number;
  variantId: string;

  product: {
    _id: string;
    name: string;
    slug: string;

    variants: Variant[]; // length = 1
  };
};
