// models/OrderItem.ts

import { Schema, model, Document, Types } from "mongoose";

export interface OrderItemDocument extends Document {
  order: Types.ObjectId;
  product: Types.ObjectId;
  quantity: number;
  priceAtPurchase: number;
  title: string;
  image: string;
}

const orderItemSchema = new Schema<OrderItemDocument>(
  {
    order: {//ya btata hai ki ya orderlist kon sa order ka hai 
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    priceAtPurchase: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      required: true,
    }, // snapshot
    image: {
      type: String,
      required: true,
    }, // snapshot
  },
  { timestamps: true }
);

orderItemSchema.index({ order: 1, product: 1 }); // Fast lookup

export const OrderItem = model<OrderItemDocument>("OrderItem", orderItemSchema);
