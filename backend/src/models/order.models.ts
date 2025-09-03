import { Schema, model, Document, Types } from "mongoose";
import { IDGenerator } from "../utils/IDGenerator";

// Enum for order status
export enum OrderStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  Shipped = "shipped",
  OutForDelivery = "out_for_delivery",
  Delivered = "delivered",
  Cancelled = "cancelled",
  Refunded = "refunded",
  Failed = "failed",
}

// Enum for payment method
export enum PaymentMethod {
  COD = "COD",
  RAZORPAY = "RAZORPAY",
  UPI = "UPI",
  Card = "Card",
  NetBanking = "Net Banking",
}

// Order Item snapshot interface
export interface OrderItemSnapshot {
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  name: string;
  image?: string;
  quantity: number;
  price: number;
  hasDiscount: boolean;
  discountPercent?: number;
  color?: string;
  size?: string;
  sku?: string;
  weight: number;
}

// Shipping Address snapshot interface
export interface ShippingAddressSnapshot {
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

export interface DeliverySnapshot {
  zone: "Zone1" | "Zone2" | "Zone3";
  deliveryCharge: number;
  originalDeliveryCharge: number;
  weightSurcharge: number;
  discount: number;
  estimatedDays: number;
  courierPartner: string;
  codAvailable: boolean;
  totalWeight: number;
  packagingFee?: number;
  codHandlingFee?: number;
  advancePaymentAmount?: number;
  remainingAmount?: number;
  trackingId?: string;
  estimatedDelivery?: Date;
}

// Payment Snapshot interface
export interface PaymentSnapshot {
  method?: PaymentMethod;
  status?: string;
  transactionId?: string;
  provider?: string;
  paidAt?: Date;
  isAdvancePayment?: boolean;
  advancePercentage?: number;
  advanceAmount?: number;
  remainingAmount?: number;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

// Final Order Document interface
export interface OrderDocument extends Document {
  orderId: string;
  idempotencyKey?: string;
  user: Types.ObjectId;
  orderItemsSnapshot: OrderItemSnapshot[];
  shippingAddressSnapshot: ShippingAddressSnapshot;
  deliverySnapshot: DeliverySnapshot;
  paymentSnapshot: PaymentSnapshot;
  status: OrderStatus;
  totalAmount: number;
  packagingFee: number;
  codHandlingFee: number;
  isAdvancePayment: boolean;
  advancePaymentAmount: number;
  remainingAmount: number;
  trackingInfo?: {
    trackingNumber?: string;
    courierPartner?: string;
    estimatedDelivery?: Date;
    actualDelivery?: Date;
  };
  placedAt: Date;
}

const orderSchema = new Schema<OrderDocument>(
  {
    orderId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    idempotencyKey: {
      type: String,
      sparse: true,
      unique: true,
    },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    orderItemsSnapshot: [
      {
        productId: { type: Schema.Types.ObjectId, required: true },
        variantId: { type: Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        image: String,
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        hasDiscount: { type: Boolean, default: false },
        discountPercent: { type: Number, default: 0 },
        color: String,
        size: String,
        sku: String,
        weight: { type: Number, required: true },
      },
    ],

    shippingAddressSnapshot: {
      fullName: { type: String, required: true },
      mobile: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: String,
      city: { type: String, required: true },
      landmark: String,
      state: { type: String, required: true },
      pincode: { type: String, required: true },
      country: { type: String, required: true },
    },

    deliverySnapshot: {
      zone: { type: String, enum: ["Zone1", "Zone2", "Zone3"] },
      deliveryCharge: { type: Number, required: true },
      originalDeliveryCharge: Number,
      weightSurcharge: { type: Number, default: 0 },
      discount: { type: Number, default: 0 },
      estimatedDays: Number,
      courierPartner: String,
      codAvailable: { type: Boolean, default: true },
      totalWeight: Number,
      packagingFee: { type: Number, default: 29 },
      codHandlingFee: { type: Number, default: 0 },
      advancePaymentAmount: { type: Number, default: 0 },
      remainingAmount: { type: Number, default: 0 },
      trackingId: String,
      estimatedDelivery: Date,
    },

    paymentSnapshot: {
      method: {
        type: String,
        enum: Object.values(PaymentMethod),
      },
      status: {
        type: String,
        enum: ["pending", "paid", "partial", "failed"],
        default: "pending",
      },
      transactionId: String,
      provider: String,
      paidAt: Date,
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
      isAdvancePayment: { type: Boolean, default: false },
      advancePercentage: { type: Number, default: 0 },
      advanceAmount: { type: Number, default: 0 },
      remainingAmount: { type: Number, default: 0 },
    },

    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Pending,
    },

    totalAmount: { type: Number, required: true },
    placedAt: { type: Date, default: Date.now },
    trackingInfo: {
      trackingNumber: String,
      courierPartner: String,
      estimatedDelivery: Date,
      actualDelivery: Date,
    },
    packagingFee: { type: Number, default: 29 },
    codHandlingFee: { type: Number, default: 0 },
    isAdvancePayment: { type: Boolean, default: false },
    advancePaymentAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ✅ Updated PRE-SAVE HOOK with new ID generator
orderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    this.orderId = await IDGenerator.generateOrderId(Order);
  }
  next();
});

// Indexes
orderSchema.index({ user: 1, placedAt: -1 });
orderSchema.index({ status: 1, placedAt: -1 });


export const Order = model<OrderDocument>("Order", orderSchema);
