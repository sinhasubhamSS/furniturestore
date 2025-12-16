import { DeliveryInfo } from "./delivery";
import { DisplayProduct, Variant } from "./Product";

/* =====================================================
   CART ITEM (matches backend Cart API response)
   ===================================================== */
export type CartItem = {
  /* ---------- Identity ---------- */
  productId: string;
  variantId: string;
  quantity: number;
  addedAt?: Date | string;

  /* ---------- UI DISPLAY DATA (FROM BACKEND) ---------- */
  name: string;
  slug: string;
  image: string;

  sku?: string;
  color?: string;
  size?: string;

  /* ---------- PRICING (DISPLAY ONLY – NOT TRUSTED) ---------- */
  listingPrice: number; // MRP
  sellingPrice: number; // discounted / final price
  discountPercent: number;
  hasDiscount: boolean;

  /* ---------- OPTIONAL (FOR LEGACY / SOME SCREENS) ---------- */
  product?: DisplayProduct; // populated only where needed
  variant?: Variant; // shortcut, not mandatory
};

/* =====================================================
   CART API RESPONSE (SINGLE SOURCE OF TRUTH)
   ===================================================== */
export type CartResponse = {
  _id: string | null;
  user: string;

  items: CartItem[];

  /* ---------- SUMMARY (BACKEND CALCULATED) ---------- */
  totalItems: number;

  cartListingTotal: number; // total MRP (before discount)
  totalDiscount: number; // total savings
  cartTotal: number; // final payable amount

  createdAt?: Date;
  updatedAt?: Date;
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

  /* ---------- DELIVERY / FUTURE ---------- */
  totalWeight: number;
  deliveryCharges: number;
  finalTotal: number;

  syncing: boolean;
  deliveryInfo: DeliveryInfo | null;
}
