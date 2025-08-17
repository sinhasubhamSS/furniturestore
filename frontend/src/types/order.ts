// src/types/order.ts

import { Address } from "./address";

export interface Order {
  _id: string;
  placedAt: string; // Example: "2025-07-31T05:53:53.664Z"
  paymentStatus: "paid" | "unpaid"; // Adjust as needed
  status: "pending" | "shipped" | "delivered" | "cancelled"; // Add more statuses as per your logic
  totalAmount: number;

  productPreview: {
    name: string;
    quantity: number;
    images: string; // Changed to array
  };

  shippingSummary: {
    name: string;
    city: string;
    state: string;
    pincode: string;
  };
}


export type PlaceOrderRequest = {
  items: {
    productId: string;
     variantId: string;
    quantity: number;
  }[];
  shippingAddress: Address;
  payment: {
    method: "COD" | "RAZORPAY";
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
  };
  fromCart?: boolean;
};

export type RazorpayOrderResponse = {
  orderId: string;
  amount: number;
  currency: string;
};
