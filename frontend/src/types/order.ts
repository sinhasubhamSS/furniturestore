import { Address } from "./address";

// ---------- BASE REUSABLE TYPES ----------
export interface OrderItem {
  productId: string;
  variantId?: string;
  quantity: number;
}

export interface OrderItemSnapshot {
  productId: string;
  name?: string;
  // backend sometimes stores single string or array -> allow both
  images?: string[] | string | null;
  quantity?: number;
  price?: number;
  _reviewedByUser?: boolean; // optional flag if you store it
}

export interface DeliveryInfo {
  zone: string;
  estimatedDays: number;
  deliveryCharge: number;
  originalCharge?: number;
  discount?: number;
  courierPartner: string;
  trackingId?: string;
  totalWeight?: number;
  pincode?: string;
  city?: string;
  codAvailable: boolean;
  isServiceable: boolean;
  message?: string;
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

// ---------- UNION TYPES ----------
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

// ---------- REQUEST INTERFACES ----------
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

// ---------- RESPONSE INTERFACES ----------
export interface CheckoutPricingResponse extends FeeBreakdown {
  codTotal: number;
  checkoutTotal: number;
  deliveryInfo: DeliveryInfo | null;
  hasDeliveryCharges: boolean;
  advanceEligible: boolean;
  advanceAmount: number;
  advancePercentage: number;
  isServiceable: boolean;
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

// ---------- Order (UPDATED) ----------
export interface Order {
  _id: string;
  orderId?: string;
  idempotencyKey?: string;
  // placedAt may be missing in some responses -> keep optional
  placedAt?: string;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  totalAmount: number;
  packagingFee?: number;
  codHandlingFee?: number;
  isAdvancePayment?: boolean;
  advancePaymentAmount?: number;
  remainingAmount?: number;

  // return info
  hasActiveReturn?: boolean;
  returnInfo?: {
    hasActiveReturn: boolean;
    returnStatus: string;
    returnId: string;
    returnRequestedAt: string;
  } | null;

  // preview used in MyOrders list (first item snapshot)
  productPreview: {
    name: string;
    quantity: number;
    // preview can be single image url or null
    images: string | null;
  };

  // full item list snapshot used in OrderDetail
  orderItemsSnapshot?: OrderItemSnapshot[];

  shippingSummary?: {
    name?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };

  deliveryInfo?: DeliveryInfo;
  paymentInfo?: PaymentInfo;
}

// ---------- Pagination wrapper ----------
export interface OrderListResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
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
