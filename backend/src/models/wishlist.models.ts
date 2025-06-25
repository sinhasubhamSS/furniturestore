// models/wishlist.model.ts
import { Schema, model, Document, Types } from "mongoose";

export interface WishlistDocument extends Document {
  user: Types.ObjectId;
  products: Types.ObjectId[]; // array of product IDs
}

const wishlistSchema = new Schema<WishlistDocument>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", unique: true },
    products: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

export const Wishlist = model<WishlistDocument>("Wishlist", wishlistSchema);
