export interface PlaceOrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface PlaceOrderAddress {
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

// ✅ Only this interface needs update - add isAdvance field
export interface PlaceOrderPayment {
  method: "COD" | "RAZORPAY";
  status?: "pending" | "paid" | "partial" | string; // ✅ Added "partial" for advance
  transactionId?: string;
  provider?: string;
  paidAt?: Date;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  isAdvance?: boolean; // ✅ NEW: Flag for advance payment
}

export interface DeliveryCalculationRequest {
  pincode: string;
  weight: number;
  orderValue?: number;
}

export interface PlaceOrderRequest {
  items: PlaceOrderItem[];
  shippingAddress: PlaceOrderAddress;
  payment: PlaceOrderPayment; // ✅ Enhanced with isAdvance

  /**
   * Optional flag to indicate order is placed from cart context.
   */
  fromCart?: boolean;
}
