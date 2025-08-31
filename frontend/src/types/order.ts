import { Address } from "./address";

// ✅ BASE REUSABLE TYPES (Single Source of Truth)
export interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface DeliveryInfo {
  zone: string;
  estimatedDays: number;
  deliveryCharge: number;
  courierPartner: string;
  trackingId?: string;
  totalWeight?: number;
  pincode?: string;
  city?: string;
  codAvailable: boolean; // ✅ Added
}

export interface PaymentInfo {
  method: PaymentMethod;
  status?: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  transactionId?: string;
  provider?: string;
  paidAt?: Date;
  isAdvance?: boolean;
}

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

// ✅ UNION TYPES (Centralized)
export type PaymentMethod = "COD" | "RAZORPAY" | "ADVANCE";
export type PaymentStatus = "paid" | "unpaid" | "partial" | "pending";
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "refunded"
  | "failed";

// ✅ REQUEST INTERFACES (Using Base Types)
export interface PlaceOrderRequest {
  items: OrderItem[];
  shippingAddress: Address;
  payment: PaymentInfo;
  fromCart?: boolean;
  idempotencyKey?: string;
}

export interface CheckoutPricingRequest {
  items: OrderItem[];
  pincode: string;
}

export interface VerifyAmountRequest {
  items: OrderItem[];
}

// ✅ RESPONSE INTERFACES (Fixed with missing properties)
export interface CheckoutPricingResponse extends FeeBreakdown {
  codTotal: number;
  checkoutTotal: number;
  deliveryInfo: DeliveryInfo | null;
  hasDeliveryCharges: boolean;
  advanceEligible: boolean; // ✅ FIXED: Added missing property
  advanceAmount: number;    // ✅ FIXED: Added missing property
}

export interface VerifyAmountResponse extends FeeBreakdown {
  verified: boolean;
  itemCount: number;
  breakdown: {
    baseAmount: number;
    fees: number;
    extraCharges: number;
    advancePercentage: number;
  };
}

export interface Order {
  _id: string;
  orderId?: string;
  idempotencyKey?: string;
  placedAt: string;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  totalAmount: number;
  
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

  deliveryInfo?: DeliveryInfo;
  paymentInfo?: PaymentInfo;
}

export interface RazorpayOrderResponse {
  orderId: string;
  amount: number;
  currency: string;
  
  id?: string;
  entity?: string;
  amount_paid?: number;
  amount_due?: number;
  status?: string;
  attempts?: number;
  receipt?: string;
  created_at?: number;
  notes?: Record<string, string>;
}

export interface OrderCreationResponse {
  success: boolean;
  orderId: string;
  isExisting: boolean;
  message?: string;
  data?: Order;
}
