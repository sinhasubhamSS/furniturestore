import { Types } from "mongoose";
import { Cart } from "../models/cart.model";
import { AppError } from "../utils/AppError";

class CartService {
  /* ---------- ADD TO CART ---------- */
  async addToCart(
    userId: string,
    productId: string,
    variantId: string,
    quantity: number
  ) {
    if (!productId || !variantId || quantity <= 0) {
      throw new AppError("Invalid cart input", 400);
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const idx = cart.items.findIndex(
      (i) =>
        i.product.toString() === productId &&
        i.variantId.toString() === variantId
    );

    if (idx > -1) {
      cart.items[idx].quantity += quantity;
    } else {
      cart.items.push({
        product: new Types.ObjectId(productId),
        variantId: new Types.ObjectId(variantId),
        quantity,
        addedAt: new Date(),
      });
    }

    await cart.populate("items.product");
    await cart.save();

    return this.getCart(userId);
  }

  /* ---------- GET CART ---------- */
  async getCart(userId: string) {
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "name slug variants",
    });

    if (!cart) {
      return {
        items: [],
        totalItems: 0,
        cartListingTotal: 0,
        totalDiscount: 0,
        cartTotal: 0,
      };
    }

    const items = cart.items.map((item: any) => {
      const product = item.product;
      const variant = product.variants.find(
        (v: any) => v._id.toString() === item.variantId.toString()
      );

      return {
        productId: product._id,
        name: product.name,
        slug: product.slug,

        variantId: variant._id,
        sku: variant.sku,
        color: variant.color,
        size: variant.size,

        image: variant.images?.[0]?.thumbSafe || variant.images?.[0]?.url,
        quantity: item.quantity,

        listingPrice: variant.listingPrice,
        sellingPrice: variant.sellingPrice,
        discountPercent: variant.discountPercent,
        hasDiscount: variant.hasDiscount,
      };
    });

    return {
      items,
      totalItems: cart.totalItems,
      cartListingTotal: cart.cartListingTotal,
      totalDiscount: cart.totalDiscount,
      cartTotal: cart.cartTotal,
    };
  }

  /* ---------- UPDATE QUANTITY ---------- */
  async updateQuantity(
    userId: string,
    productId: string,
    variantId: string,
    quantity: number
  ) {
    if (quantity <= 0) {
      return this.removeItem(userId, productId, variantId);
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new AppError("Cart not found", 404);

    const item = cart.items.find(
      (i) =>
        i.product.toString() === productId &&
        i.variantId.toString() === variantId
    );

    if (!item) throw new AppError("Item not found", 404);

    item.quantity = quantity;

    await cart.populate("items.product");
    await cart.save();

    return this.getCart(userId);
  }

  /* ---------- REMOVE ITEM ---------- */
  async removeItem(userId: string, productId: string, variantId: string) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new AppError("Cart not found", 404);

    cart.items = cart.items.filter(
      (i) =>
        !(
          i.product.toString() === productId &&
          i.variantId.toString() === variantId
        )
    );

    await cart.populate("items.product");
    await cart.save();

    return this.getCart(userId);
  }

  /* ---------- CLEAR CART ---------- */
  async clearCart(userId: string) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new AppError("Cart not found", 404);

    cart.items = [];
    cart.cartListingTotal = 0;
    cart.totalDiscount = 0;
    cart.cartTotal = 0;
    cart.totalItems = 0;

    await cart.save();

    return this.getCart(userId);
  }
  async getCartCount(userId: string) {
    const cart = await Cart.findOne({ user: userId }).select("totalItems");
    return cart?.totalItems || 0;
  }

  // ✅ Get unique items count
  async getUniqueItemsCount(userId: string) {
    const cart = await Cart.findOne({ user: userId }).select("items");
    return cart?.items.length || 0;
  }
}

export const cartService = new CartService();
