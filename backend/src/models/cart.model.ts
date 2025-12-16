import { Schema, model, Document, Types } from "mongoose";

/* ---------- Interfaces ---------- */

export interface ICartItem {
  product: Types.ObjectId;
  variantId: Types.ObjectId;
  quantity: number;
  addedAt: Date;
}

export interface CartDocument extends Document {
  user: Types.ObjectId;
  items: ICartItem[];

  totalItems: number;

  cartListingTotal: number; // total MRP
  totalDiscount: number; // total discount
  cartTotal: number; // payable amount
}

/* ---------- Sub Schema ---------- */

const cartItemSchema = new Schema<ICartItem>(
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
    quantity: {
      type: Number,
      min: 1,
      required: true,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/* ---------- Cart Schema ---------- */

const cartSchema = new Schema<CartDocument>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      required: true,
    },

    items: [cartItemSchema],

    totalItems: {
      type: Number,
      default: 0,
    },

    cartListingTotal: {
      type: Number,
      default: 0,
    },

    totalDiscount: {
      type: Number,
      default: 0,
    },

    cartTotal: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/* ---------- Pre Save Pricing Logic ---------- */

cartSchema.pre("save", function (next) {
  this.totalItems = this.items.reduce((s, i) => s + i.quantity, 0);

  if (!this.populated("items.product")) {
    return next();
  }

  let listingTotal = 0;
  let discountTotal = 0;
  let payableTotal = 0;

  for (const item of this.items) {
    const product: any = item.product;

    const variant = product?.variants?.find(
      (v: any) => v._id.toString() === item.variantId.toString()
    );

    if (!variant) continue;

    const qty = item.quantity;

    const listingPrice = variant.listingPrice ?? variant.sellingPrice;
    const sellingPrice = variant.sellingPrice;

    const itemListingTotal = listingPrice * qty;
    const itemSellingTotal = sellingPrice * qty;

    listingTotal += itemListingTotal;
    payableTotal += itemSellingTotal;
    discountTotal += itemListingTotal - itemSellingTotal;
  }

  this.cartListingTotal = Math.round(listingTotal);
  this.totalDiscount = Math.round(discountTotal);
  this.cartTotal = Math.round(payableTotal);

  next();
});

/* ---------- Index ---------- */
cartSchema.index({ user: 1 });

/* ---------- Export ---------- */
export const Cart = model<CartDocument>("Cart", cartSchema);
