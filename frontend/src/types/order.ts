import { Address } from "./address";

// ✅ Enhanced Order interface
export interface Order {
  _id: string;
  orderId?: string;
  idempotencyKey?: string;
  placedAt: string;
  paymentStatus: "paid" | "unpaid" | "partial"; // ✅ Added "partial" for advance
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
  
  // ✅ NEW: Fee breakdown fields
  packagingFee?: number;
  codHandlingFee?: number;
  isAdvancePayment?: boolean;
  advancePaymentAmount?: number;
  remainingAmount?: number;

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
    pincode?: string; // ✅ Added for delivery details
    city?: string;
  };
  
  // ✅ NEW: Advanced payment info
  paymentInfo?: {
    method: "COD" | "RAZORPAY";
    isAdvancePayment: boolean;
    advancePercentage?: number;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
  };
}

// ✅ Enhanced PlaceOrderRequest
export interface PlaceOrderRequest {
  items: {
    productId: string;
    variantId?: string;
    quantity: number;
  }[];
  shippingAddress: Address;
  payment: {
    method: "COD" | "RAZORPAY";
    status?: "pending" | "paid" | "partial" | string;
    transactionId?: string;
    provider?: string;
    paidAt?: Date;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    isAdvance?: boolean; // ✅ Already added
  };
  fromCart?: boolean;
  idempotencyKey?: string;
}

// ✅ Enhanced RazorpayOrderResponse with proper Razorpay fields
export interface RazorpayOrderResponse {
  // Your app fields
  orderId: string;
  amount: number;
  currency: string;
  
  // ✅ Standard Razorpay response fields
  id?: string;              // Razorpay internal order ID
  entity?: string;          // "order"
  amount_paid?: number;     // Amount paid so far
  amount_due?: number;      // Remaining amount
  status?: string;          // "created", "paid", etc.
  attempts?: number;        // Payment attempts
  receipt?: string;         // Merchant receipt ID
  created_at?: number;      // Timestamp
  notes?: Record<string, string>; // Custom notes
}

// ✅ NEW: VerifyAmountResponse (for price verification)
export interface VerifyAmountResponse {
  totalAmount: number;
  subtotal: number;
  packagingFee: number;
  deliveryCharge: number;
  codHandlingFee: number;
  advanceAmount?: number;
  remainingAmount?: number;
  isEligibleForAdvance: boolean;
  breakdown: {
    baseAmount: number;
    fees: number;
    extraCharges: number;
    advancePercentage: number;
  };
  // ✅ Allow additional properties from backend
  [key: string]: any;
}

// ✅ NEW: Order creation result
export interface OrderCreationResponse {
  success: boolean;
  orderId: string;
  isExisting: boolean;
  message?: string;
  data?: Order;
}

// ✅ NEW: Payment method types for better type safety
export type PaymentMethod = "COD" | "RAZORPAY" | "ADVANCE";

// ✅ NEW: Order status for better tracking
export type OrderStatus = 
  | "pending"
  | "confirmed" 
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "failed";

// ✅ NEW: Payment status types
export type PaymentStatus = "paid" | "unpaid" | "partial" | "pending";

// ✅ NEW: Fee calculation request
export interface FeeCalculationRequest {
  items: {
    productId: string;
    variantId: string;
    quantity: number;
  }[];
  shippingAddress?: Address;
  paymentMethod?: PaymentMethod;
  isAdvance?: boolean;
}

// ✅ NEW: Fee breakdown response
export interface FeeBreakdown {
  subtotal: number;
  packagingFee: number;
  deliveryCharge: number;
  codHandlingFee: number;
  advanceAmount: number;
  remainingAmount: number;
  totalAmount: number;
  isEligibleForAdvance: boolean;
}
