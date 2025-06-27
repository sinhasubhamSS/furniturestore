import { Schema, model, Document, Types, models } from "mongoose";
import { PaymentMethodEnum, PaymentStatusEnum } from "../constants/enums";

export interface IPayment extends Document {
  orderId: Types.ObjectId;
  userId: Types.ObjectId;
  paymentMethod: PaymentMethodEnum;
  paymentStatus: PaymentStatusEnum;
  transactionId?: string;
  amount: number;
  provider?: string;
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
    transactionId: { type: String },
    amount: { type: Number, required: true },
    provider: { type: String },
  },
  { timestamps: true }
);

const Payment = models.Payment || model<IPayment>("Payment", paymentSchema);
export default Payment;
