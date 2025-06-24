//if agar mongoose instance bnnane ki need hai tab document ka use karna hota hai 

import { Schema, model, Document, Types } from "mongoose";

export interface CartDocument extends Document {
  user: Types.ObjectId;
  items: Types.ObjectId[]; // references to CartItem
}

const cartSchema = new Schema<CartDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    items: [{ type: Schema.Types.ObjectId, ref: "CartItem" }],
  },
  { timestamps: true }
);

export const Cart = model<CartDocument>("Cart", cartSchema);
