import { Schema, model, Document, Types, models } from "mongoose";

export interface IPayment extends Document {
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  paymentMethod: "COD" | "UPI" | "CARD" | "NETBANKING";
  paymentStatus: "pending" | "paid" | "failed";
  transactionId?: string;
  amount: number;
  provider?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["COD", "UPI", "CARD", "NETBANKING"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    transactionId: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    provider: {
      type: String,
    },
  },
  { timestamps: true }
);

const Payment =models.Payment || model<IPayment>("Payment", paymentSchema);

export default Payment;
