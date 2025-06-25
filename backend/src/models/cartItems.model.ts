import { Schema, model, Document, Types } from "mongoose";

export interface CartItemDocument extends Document {
  user: Types.ObjectId;
  product: Types.ObjectId;
  quantity: number;
  addedAt: Date;
}

const cartItemSchema = new Schema<CartItemDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    product: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    addedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
cartItemSchema.index({ user: 1, product: 1 }, { unique: true });

export const CartItem = model<CartItemDocument>("CartItem", cartItemSchema);
