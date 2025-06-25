import { Types } from "mongoose";
import { Wishlist } from "../models/wishlist.models";
import { AppError } from "../utils/AppError";

class WishlistService {
  async addToWishlist(userId: string, productId: string) {
    if (!productId) throw new AppError("product id is required", 403);
    let wishlist = await Wishlist.findOne({ user: userId });
    //if not wishlist then check and create new wishlist
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, products: [] });
    }
    // const alreadyExisting = wishlist.products.includes(productId as any);

    const alreadyExisting = wishlist.products.some((id) =>
      id.equals(new Types.ObjectId(productId))
    );

    if (alreadyExisting) throw new AppError("Product already in wishlist", 409);
    wishlist.products.push(new Types.ObjectId(productId));
    await wishlist.save();
    return wishlist;
  }
  async removeFromWishlist(userId: string, productId: string) {
    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      throw new AppError("Wishlist not found", 404);
    }

    wishlist.products = wishlist.products.filter(
      (pid) => !pid.equals(new Types.ObjectId(productId))
    );

    await wishlist.save();
    return { message: "Product removed from wishlist" };
  }

  async getWishlist(userId: string) {
    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) {
      throw new AppError("Wishlist not found", 404);
    }

    // return just an array of product IDs
    return wishlist.products.map((pid) => pid.toString());
  }

  async isInWishlist(userId: string, productId: string) {
    const wishlist = await Wishlist.findOne({ user: userId });

    if (!wishlist) return { isWishlisted: false };

    const isWishlisted = wishlist.products.some(
      (id) => id.toString() === productId
    );

    return { isWishlisted };
  }
  async getWishlistWithProducts(userId: string) {
    const wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: "products",
      select: "name price image",
    });

    if (!wishlist) {
      throw new AppError("Wishlist not found", 404);
    }

    return wishlist.products;
  }
}
export const wishlistService = new WishlistService();
