// src/shared/types/order.ts
import { Address } from "./address";

export interface Order {
  _id: string;
  orderId?: string;
  idempotencyKey?: string;
  placedAt: string;
  paymentStatus: "paid" | "unpaid";
  status:
    | "pending"
    | "confirmed"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "refunded"
    | "failed";
  totalAmount: number;

  productPreview: {
    name: string;
    quantity: number;
    images: string | null;
  };

  shippingSummary: {
    name: string;
    city: string;
    state: string;
    pincode: string;
  };

  deliveryInfo?: {
    zone: string;
    estimatedDays: number;
    deliveryCharge: number;
    courierPartner: string;
    trackingId?: string;
    totalWeight?: number;
  };
}

export interface PlaceOrderRequest {
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
  shippingAddress: Address;
  payment: {
    method: "COD" | "RAZORPAY";
    status?: "pending" | "paid" | string;
    transactionId?: string;
    provider?: string;
    paidAt?: Date;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  };
  fromCart?: boolean;
  idempotencyKey?: string;
}

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
}
