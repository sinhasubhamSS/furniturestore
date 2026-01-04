import { Schema, model, Document, Types } from "mongoose";

export interface WishlistItem {
  product: Types.ObjectId;
  variantId: Types.ObjectId;
}

export interface WishlistDocument extends Document {
  user: Types.ObjectId;
  items: WishlistItem[];
}

const wishlistSchema = new Schema<WishlistDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variantId: {
          type: Schema.Types.ObjectId,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

export const Wishlist = model<WishlistDocument>("Wishlist", wishlistSchema);
