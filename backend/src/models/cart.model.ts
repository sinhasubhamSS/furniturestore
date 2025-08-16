import { Schema, model, Document, Types } from "mongoose";

// ✅ Define interface for methods
export interface ICartMethods {
  calculateTotals(): Promise<CartDocument>;
}

// ✅ Cart item interface
export interface ICartItem {
  product: Types.ObjectId;
  variantId: Types.ObjectId;
  quantity: number;
  addedAt: Date;
}

// ✅ Updated CartDocument interface with methods
export interface CartDocument extends Document, ICartMethods {
  user: Types.ObjectId;
  items: ICartItem[];
  totalItems: number;
  cartSubtotal: number;
  cartGST: number;
  cartTotal: number;
}

const cartItemSubSchema = new Schema<ICartItem>(
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
      required: true,
      min: 1,
      default: 1,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// ✅ Define schema with proper typing
const cartSchema = new Schema<CartDocument, {}, ICartMethods>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    items: [cartItemSubSchema],
    totalItems: {
      type: Number,
      default: 0,
    },
    cartSubtotal: {
      type: Number,
      default: 0,
    },
    cartGST: {
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

// ✅ Pre-save hook
cartSchema.pre("save", async function (next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);

  if (this.populated("items.product")) {
    let subtotal = 0;
    let gstAmount = 0;
    let totalWithGST = 0;

    for (let item of this.items) {
      const product = item.product as any;
      const variant = product.variants?.find(
        (v: any) => v._id.toString() === item.variantId.toString()
      );

      if (variant) {
        let itemFinalPrice: number;
        let itemBasePrice: number;
        let itemGSTAmount: number;

        if (variant.hasDiscount && variant.discountedPrice) {
          itemFinalPrice = variant.discountedPrice * item.quantity;
          itemGSTAmount =
            (itemFinalPrice * variant.gstRate) / (100 + variant.gstRate);
          itemBasePrice = itemFinalPrice - itemGSTAmount;
        } else {
          itemFinalPrice = variant.price * item.quantity;
          itemBasePrice = variant.basePrice * item.quantity;
          itemGSTAmount =
            (variant.basePrice * item.quantity * variant.gstRate) / 100;
        }

        subtotal += itemBasePrice;
        gstAmount += itemGSTAmount;
        totalWithGST += itemFinalPrice;
      }
    }

    this.cartSubtotal = Math.round(subtotal * 100) / 100;
    this.cartGST = Math.round(gstAmount * 100) / 100;
    this.cartTotal = Math.round(totalWithGST * 100) / 100;
  }

  next();
});

// ✅ Define method using schema.methods (proper way)
cartSchema.methods.calculateTotals = async function (): Promise<CartDocument> {
  await this.populate("items.product");
  await this.save(); // This will trigger pre-save hook
  return this;
};

// Virtual
cartSchema.virtual("itemCount").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Indexes
cartSchema.index({ user: 1 });
cartSchema.index({ user: 1, "items.product": 1, "items.variantId": 1 });
cartSchema.index({ user: 1, updatedAt: -1 });

export const Cart = model<CartDocument>("Cart", cartSchema);
