import { Schema, model, Document, Types, models } from "mongoose";
import { PaymentMethodEnum, PaymentStatusEnum } from "../constants/enums";

export interface IPayment extends Document {
  orderId: Types.ObjectId; // Your internal Order _id
  userId: Types.ObjectId;
  paymentMethod: PaymentMethodEnum;
  paymentStatus: PaymentStatusEnum;
  transactionId?: string; // Razorpay Payment ID
  amount: number;
  provider?: string;

  // Razorpay Specific
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;

  createdAt: Date;
  updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },

    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethodEnum),
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatusEnum),
      default: PaymentStatusEnum.PENDING,
    },

    transactionId: { type: String }, // razorpay_payment_id
    amount: { type: Number, required: true },
    provider: { type: String },

    // Razorpay fields
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
  },
  { timestamps: true }
);

const Payment = models.Payment || model<IPayment>("Payment", paymentSchema);
export default Payment;
