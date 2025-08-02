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
  Failed = "failed",             // delivery failed add kar sakte hain
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
export interface OrderItemSnapshot {
  productId: Types.ObjectId;
  name: string;
  image?: string;
  quantity: number;
  price: number;
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
}

// Final Order Document interface
export interface OrderDocument extends Document {
  user: Types.ObjectId;
  orderItemsSnapshot: OrderItemSnapshot[];
  shippingAddressSnapshot: ShippingAddressSnapshot;
  paymentSnapshot: PaymentSnapshot;
  status: OrderStatus;
  totalAmount: number;
  placedAt: Date;
}

const orderSchema = new Schema<OrderDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    orderItemsSnapshot: [
      {
        productId: { type: Schema.Types.ObjectId, required: true },
        name: { type: String, required: true },
        image: String,
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
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
    },

    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Pending,
    },

    totalAmount: { type: Number, required: true },
    placedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Index for recent user orders
orderSchema.index({ user: 1, placedAt: -1 });

export const Order = model<OrderDocument>("Order", orderSchema);
