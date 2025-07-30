export interface PlaceOrderItem {
  productId: string;
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

export interface PlaceOrderPayment {
  method: "COD" | "RAZORPAY";
  status?: "pending" | "paid" | string;
  transactionId?: string;
  provider?: string;
  paidAt?: Date;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export interface PlaceOrderRequest {
  items: PlaceOrderItem[];
  shippingAddress: PlaceOrderAddress;
  payment: PlaceOrderPayment;

  /**
   * Optional flag to indicate order is placed from cart context.
   * Useful for backend logic to trigger cart cleanup or other actions.
   */
  fromCart?: boolean;
}
