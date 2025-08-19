import { Schema, model, Document, Types } from "mongoose";

// Enum for order status
export enum OrderStatus {
  Pending = "pending",
  Confirmed = "confirmed",
  Shipped = "shipped",
  OutForDelivery = "out_for_delivery", // optional
  Delivered = "delivered",
  Cancelled = "cancelled",
  Refunded = "refunded",
  Failed = "failed", // delivery failed add kar sakte hain
}

// Enum for payment method (optional but good practice)
export enum PaymentMethod {
  COD = "COD",
  RAZORPAY = "RAZORPAY",
  UPI = "UPI",
  Card = "Card",
  NetBanking = "Net Banking",
}

// Order Item snapshot interface
// ✅ Clean interface - only what matters for user
export interface OrderItemSnapshot {
  productId: Types.ObjectId;
  variantId: Types.ObjectId;

  name: string;
  image?: string;
  quantity: number;
  price: number; // ✅ Final price that user paid (either price or discountedPrice)
  hasDiscount: boolean;
  discountPercent?: number;
  color?: string;
  size?: string;
  sku?: string;
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

// Payment Snapshot interface
export interface PaymentSnapshot {
  method?: PaymentMethod;
  status?: string;
  transactionId?: string;
  provider?: string;
  paidAt?: Date;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string; // For verification
}

async function getTodayOrderCount(): Promise<number> {
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  return await Order.countDocuments({
    createdAt: { $gte: todayStart, $lt: todayEnd },
  });
}

export async function generateStandardOrderId(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const todayCount = await getTodayOrderCount();
  const sequence = (todayCount + 1).toString().padStart(5, "0");
  return `SUVI-${dateStr}-${sequence}`;
}

// Final Order Document interface
export interface OrderDocument extends Document {
  orderId: string;
  idempotencyKey?: string;
  user: Types.ObjectId;
  orderItemsSnapshot: OrderItemSnapshot[];
  shippingAddressSnapshot: ShippingAddressSnapshot;
  paymentSnapshot: PaymentSnapshot;
  status: OrderStatus;
  totalAmount: number;
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
        price: { type: Number, required: true }, // ✅ Only this price
        hasDiscount: { type: Boolean, default: false },
        discountPercent: { type: Number, default: 0 },
        color: String,
        size: String,
        sku: String,
        // No basePrice field
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

    paymentSnapshot: {
      method: {
        type: String,
        enum: Object.values(PaymentMethod),
      },
      status: String,
      transactionId: String,
      provider: String,
      paidAt: Date,
      razorpayOrderId: String,
      razorpayPaymentId: String,
      razorpaySignature: String,
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
  },

  { timestamps: true }
);

// ✅ ADD PRE-SAVE HOOK
// Order model में temporarily यह test करें
orderSchema.pre("save", function (next) {
  console.log("🚀 PRE-SAVE HOOK CALLED!");
  console.log("Current orderId:", this.orderId);

  if (!this.orderId) {
    console.log("⚙️ Setting test OrderID...");
    this.orderId = "TEST-ORDER-ID-12345";
    console.log("✅ Test OrderID set:", this.orderId);
  }

  next();
});

// Index for recent user orders
orderSchema.index({ user: 1, placedAt: -1 });
// ✅ ADD ORDERID INDEX

export const Order = model<OrderDocument>("Order", orderSchema);
