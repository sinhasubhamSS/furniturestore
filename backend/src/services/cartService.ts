import { Types } from "mongoose";
import { Cart } from "../models/cart.model";
import { CartItem } from "../models/cartItems.model";
import { AppError } from "../utils/AppError";

class CartService {
  async addToCart(userId: string, productId: string, quantity: number) {
    if (!productId || quantity <= 0)
      throw new AppError("Product ID or quantity is required", 403);

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }

    let existingItem = await CartItem.findOne({
      user: userId,
      product: productId,
    });

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
      await cart.save();
    }

    return this.getCart(userId);
  }

 async getCart(userId: string) {
  const cart = await Cart.aggregate([
    { $match: { user: new Types.ObjectId(userId) } },
    
    // Lookup and process items in a single stage
    {
      $lookup: {
        from: "cartitems",
        localField: "items",
        foreignField: "_id",
        as: "items",
        pipeline: [
          // Lookup product details
          {
            $lookup: {
              from: "products",
              localField: "product",
              foreignField: "_id",
              as: "product",
            }
          },
          // Unwind product while preserving items
          { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
          
          // Add calculated fields
          {
            $addFields: {
              subtotal: {
                $cond: [
                  { $ifNull: ["$product", false] },
                  { $multiply: ["$quantity", "$product.basePrice"] },
                  0
                ]
              },
              gstAmount: {
                $cond: [
                  { $ifNull: ["$product", false] },
                  {
                    $multiply: [
                      { $multiply: ["$quantity", "$product.basePrice"] },
                      "$product.gstRate"
                    ]
                  },
                  0
                ]
              },
              totalWithGST: {
                $cond: [
                  { $ifNull: ["$product", false] },
                  { $multiply: ["$quantity", "$product.price"] },
                  0
                ]
              }
            }
          }
        ]
      }
    },
    
    // Calculate cart totals
    {
      $addFields: {
        cartSubtotal: { $sum: "$items.subtotal" },
        cartGST: { $sum: "$items.gstAmount" },
        cartTotal: { $sum: "$items.totalWithGST" }
      }
    },
    
    // Add verification field
    {
      $addFields: {
        totalVerification: {
          $eq: [
            { $round: ["$cartTotal", 2] },
            { $round: [{ $add: ["$cartSubtotal", "$cartGST"] }, 2] }
          ]
        }
      }
    }
  ]);

  if (!cart.length) throw new AppError("Cart not found", 404);
  return cart[0];
}
  async updateQuantity(userId: string, productId: string, quantity: number) {
    if (quantity <= 0) {
      return this.removeItem(userId, productId);
    }

    const item = await CartItem.findOne({ user: userId, product: productId });
    if (!item) throw new AppError("Item not found in cart", 404);

    item.quantity = quantity;
    await item.save();

    return this.getCart(userId);
  }

  async removeItem(userId: string, productId: string) {
    const item = await CartItem.findOneAndDelete({
      user: userId,
      product: productId,
    });
    if (!item) throw new AppError("Item not found", 404);

    await Cart.updateOne({ user: userId }, { $pull: { items: item._id } });

    return this.getCart(userId);
  }

  async clearCart(userId: string) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new AppError("Cart not found", 404);

    await CartItem.deleteMany({ _id: { $in: cart.items } });
    cart.items = [];
    await cart.save();

    return this.getCart(userId);
  }

  async getCartCount(userId: string) {
    const items = await CartItem.find({ user: userId });
    return items.reduce((acc, item) => acc + item.quantity, 0);
  }
}

export const cartService = new CartService();
