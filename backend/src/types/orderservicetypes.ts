// Base interfaces (ye zaroori hain)
export interface BaseItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface BaseAddress {
  fullName: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  landmark?: string;
  state: string;
  pincode: string;
  country: string;
}

export interface BasePayment {
  method: "COD" | "RAZORPAY";
  status?: "pending" | "paid" | "partial";
  transactionId?: string;
  provider?: string;
  paidAt?: Date;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  isAdvance?: boolean;
}

// Simple aliases (no extra complexity)
export type PlaceOrderItem = BaseItem;
export type PlaceOrderAddress = BaseAddress;
export type PlaceOrderPayment = BasePayment;

export interface PlaceOrderRequest {
  items: PlaceOrderItem[];
  shippingAddress: PlaceOrderAddress;
  payment: PlaceOrderPayment;
  fromCart?: boolean;
}
