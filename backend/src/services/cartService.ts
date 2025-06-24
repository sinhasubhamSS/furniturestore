import { Types } from "mongoose";
import { Cart } from "../models/cart.model";
import { CartItem } from "../models/cartItems.model";
import { AppError } from "../utils/AppError";

class CartService {
  async addToCart(userId: string, productId: string, quantity: number) {
    if (!productId || quantity <= 0)
      throw new AppError("product id or quantity is required", 403);

    let cart = await Cart.findOne({ user: userId });
    //we chaecked cart hai ki nhi ab hai to thik hai but nahi hai to cart create karna hoga
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    //ab agar  jo product add to cart kar rhe hai agar wo pahla sa hai then check karte hai
    let existingItem = await CartItem.findOne({
      user: userId,
      product: productId,
    });
    //ab agar wahi product available hai to uska count quantity increase kar date hi aur agar nahi hai to naya bana ke add kar data hu
    if (existingItem) {
      existingItem.quantity += quantity;
      await existingItem.save();
    } else {
      const newItem = await CartItem.create({
        user: userId,
        product: productId,
        quantity,
        addedAt: new Date(),
      });
      cart.items.push(newItem._id as Types.ObjectId);
    }

    await cart.save();
    return cart;
  }
  async getCart(userId: string) {
    //ab what is next step ki user id sa find karte hai uska cart thik hai
    // then cart me item ka id hai and uss item ka andar product ka id hai usko populate kar denge
    const cart = await Cart.findOne({ user: userId }).populate({
      path: "items",
      populate: {
        path: "product",
      },
    });

    if (!cart) throw new AppError("Cart not found", 404);
    return cart;
  }
  async updateQuantity(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeItem(userId, productId);
    }

    const item = await CartItem.findOne({ user: userId, product: productId });
    if (!item) throw new AppError("Item not found in cart", 404);

    item.quantity = quantity;
    await item.save();

    return item;
  }
  async removeItem(userId: string, productId: string) {
    const item = await CartItem.findOneAndDelete({
      user: userId,
      product: productId,
    });
    if (!item) throw new AppError("Item not found", 404);

    await Cart.updateOne({ user: userId }, { $pull: { items: item._id } });

    return { message: "Item removed from cart" };
  }
  async clearCart(userId: string) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new AppError("Cart not found", 404);

    await CartItem.deleteMany({ _id: { $in: cart.items } });
    cart.items = [];
    await cart.save();

    return { message: "Cart cleared" };
  }
  async getCartCount(userId: string) {
    const cart = await Cart.findOne({ user: userId });
    return cart ? cart.items.length : 0;
  }
}
export const cartService = new CartService();
