import { Schema, model, Document, Types } from "mongoose";

// Interface for cart item
export interface ICartItem {
  product: Types.ObjectId;
  variantId: Types.ObjectId;
  quantity: number;
  addedAt: Date;
}

// Interface for cart document methods
export interface ICartMethods {
  calculateTotals(): Promise<CartDocument>;
}

// Cart document interface with methods
export interface CartDocument extends Document, ICartMethods {
  user: Types.ObjectId;
  items: ICartItem[];
  totalItems: number;
  cartSubtotal: number;
  cartGST: number;
  cartTotal: number;
}

// Sub-schema for cart items (embedded in Cart)
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

// Cart schema with methods and pre-save hook
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

// Pre-save hook to calculate totals before saving
cartSchema.pre("save", async function (next) {
  this.totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
  console.log("🟢 Cart Pre-save: totalItems =", this.totalItems);

  if (this.populated("items.product")) {
    let subtotal = 0;
    let gstAmount = 0;
    let totalWithGST = 0;

    for (const item of this.items) {
      const product = item.product as any;
      const variant = product.variants?.find(
        (v: any) => v._id.toString() === item.variantId.toString()
      );

      if (variant) {
        let itemFinalPrice: number;
        let itemBasePrice: number;
        let itemGSTAmount: number;

        console.log("🟢 Variant details:", {
          price: variant.price,
          discountedPrice: variant.discountedPrice,
          basePrice: variant.basePrice,
          hasDiscount: variant.hasDiscount,
          gstRate: variant.gstRate,
          quantity: item.quantity,
        });

        // Aligned logic using GST inclusive prices
        if (variant.hasDiscount && variant.discountedPrice !== undefined) {
          itemFinalPrice = variant.discountedPrice * item.quantity; // GST inclusive
          itemBasePrice = variant.basePrice * item.quantity;         // GST exclusive
          itemGSTAmount = itemFinalPrice - itemBasePrice;            // GST amount as difference
          console.log("🟢 Discounted pricing applied.", {
            itemFinalPrice,
            itemBasePrice,
            itemGSTAmount,
          });
        } else {
          itemFinalPrice = variant.price * item.quantity;             // GST inclusive
          itemBasePrice = variant.basePrice * item.quantity;          // GST exclusive
          itemGSTAmount = itemFinalPrice - itemBasePrice;             // GST amount
          console.log("🟢 Regular pricing applied.", {
            itemFinalPrice,
            itemBasePrice,
            itemGSTAmount,
          });
        }

        subtotal += itemBasePrice;
        gstAmount += itemGSTAmount;
        totalWithGST += itemFinalPrice;
      } else {
        console.warn(`⚠️ Variant not found for item with variantId ${item.variantId}`);
      }
    }

    // Final rounding
    this.cartSubtotal = Math.round(subtotal * 100) / 100;
    this.cartGST = Math.round(gstAmount * 100) / 100;
    this.cartTotal = Math.round(totalWithGST * 100) / 100;

    console.log(
      "🟢 Cart Pre-save Totals: subtotal =",
      this.cartSubtotal,
      ", GST =",
      this.cartGST,
      ", total =",
      this.cartTotal
    );
  } else {
    console.warn("⚠️ items.product not populated, skipping totals calculation");
  }

  next();
});


cartSchema.methods.calculateTotals = async function (): Promise<CartDocument> {
  await this.populate("items.product");

  await this.save();
 
  return this;
};

cartSchema.methods.calculateTotals = async function (): Promise<CartDocument> {
  await this.populate("items.product");
 
  await this.save();

  return this;
};

// Instance method to calculate totals and save cart document
cartSchema.methods.calculateTotals = async function (): Promise<CartDocument> {
  await this.populate("items.product"); // populate products for all items
  await this.save(); // triggers pre-save hook to calc totals
  return this;
};

// Virtual property for item count (sum of quantities)
cartSchema.virtual("itemCount").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

// Indexes to optimize queries
cartSchema.index({ user: 1, "items.product": 1, "items.variantId": 1 });
cartSchema.index({ user: 1, updatedAt: -1 });

// Export Cart model
export const Cart = model<CartDocument>("Cart", cartSchema);
