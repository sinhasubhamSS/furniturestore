import { Types } from "mongoose";
import { Cart } from "../models/cart.model";
import { AppError } from "../utils/AppError";

class CartService {
  // ✅ Add item with variant support
  async addToCart(
    userId: string,
    productId: string,
    variantId: string,
    quantity: number
  ) {
    if (!productId || !variantId || quantity <= 0) {
      throw new AppError(
        "Product ID, Variant ID and quantity are required",
        400
      );
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if item already exists (same product + variant)
    const existingItemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.variantId.toString() === variantId
    );

    if (existingItemIndex > -1) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        product: new Types.ObjectId(productId),
        variantId: new Types.ObjectId(variantId),
        quantity,
        addedAt: new Date(),
      });
    }

    // ✅ Auto-calculate totals using the new method
    await cart.calculateTotals();
    return this.getCart(userId);
  }

  // ✅ Get cart with populated data
  async getCart(userId: string) {
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items.product",
      select: "name title variants category slug price lowestDiscountedPrice",
      populate: {
        path: "category",
        select: "name",
      },
    });

    if (!cart) {
      return {
        _id: null,
        user: userId,
        items: [],
        totalItems: 0,
        cartSubtotal: 0,
        cartGST: 0,
        cartTotal: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    await cart.calculateTotals();

    const cartObj = cart.toObject();

    // Removed variant filtering block to send full variants

    return {
      _id: cartObj._id,
      user: cartObj.user,
      items: cartObj.items,
      totalItems: cartObj.totalItems,
      cartSubtotal: cartObj.cartSubtotal,
      cartGST: cartObj.cartGST,
      cartTotal: cartObj.cartTotal,
    };
  }

  // ✅ Update quantity with variant support
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

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.variantId.toString() === variantId
    );

    if (itemIndex === -1) {
      throw new AppError("Item not found in cart", 404);
    }

    cart.items[itemIndex].quantity = quantity;

    await cart.calculateTotals();

    return this.getCart(userId);
  }

  // ✅ Remove item with variant support
  async removeItem(userId: string, productId: string, variantId: string) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new AppError("Cart not found", 404);

    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        item.variantId.toString() === variantId
    );

    if (itemIndex === -1) {
      throw new AppError("Item not found in cart", 404);
    }

    cart.items.splice(itemIndex, 1);
    await cart.calculateTotals();

    return this.getCart(userId);
  }

  // ✅ Clear entire cart
  async clearCart(userId: string) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new AppError("Cart not found", 404);

    cart.items = [];
    await cart.save(); // Will auto-calculate totals as 0

    return this.getCart(userId);
  }

  // ✅ Get cart count (total items)
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
