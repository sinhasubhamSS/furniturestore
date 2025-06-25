import { Schema, model, Document, Types } from "mongoose";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

export interface OrderDocument extends Document {
  user: Types.ObjectId;
  orderItems: Types.ObjectId[];
  shippingAddress: Types.ObjectId;
  payment: Types.ObjectId;
  status: OrderStatus;
  totalAmount: number;
  placedAt: Date;
}

const orderSchema = new Schema<OrderDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderItems: [
      {
        type: Schema.Types.ObjectId,
        ref: "OrderItem",
        required: true,
      },
    ],
    shippingAddress: {
      type: Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    payment: {
      type: Schema.Types.ObjectId,
      ref: "Payment",
      required: true,
    },
    status: {
      type: String,
      enum: [
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    placedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

orderSchema.index({ user: 1, placedAt: -1 }); // Fast recent order lookup per user

export const Order = model<OrderDocument>("Order", orderSchema);
