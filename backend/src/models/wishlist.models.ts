import { Schema, model, Document, Types } from "mongoose";

/* ================= TYPES ================= */

export interface WishlistItem {
  product: Types.ObjectId;
  variantId: Types.ObjectId;
}

export interface WishlistDocument extends Document {
  user: Types.ObjectId;
  items: WishlistItem[];
}

/* ================= SCHEMA ================= */

const wishlistSchema = new Schema<WishlistDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // ✅ one wishlist per user
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

/* ================= 🔥 MOST IMPORTANT FIX ================= */
/**
 * Prevents:
 * - duplicate wishlist items
 * - refresh ke baad heart gayab
 * - wishlist page me multiple same product
 */
wishlistSchema.index(
  {
    user: 1,
    "items.product": 1,
    "items.variantId": 1,
  },
  { unique: true }
);

/* ================= MODEL ================= */

export const Wishlist = model<WishlistDocument>("Wishlist", wishlistSchema);
