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

    // ✅ If wishlist doesn't exist yet, return empty array instead of error
    if (!wishlist) {
      return [];
    }

    // ✅ Return product IDs as strings
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
  // wishlistService.ts में enhanced getWishlistWithProducts method:
  // wishlistService.ts में getWishlistWithProducts को update करें:
  async getWishlistWithProducts(userId: string) {
    console.log("🔍 Fetching wishlist for user:", userId);

    const wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: "products",
      select: "name price images slug title variants category", // ✅ Added variants and category
      populate: {
        path: "variants", // ✅ Populate variants sub-documents
        select:
          "_id color size price discountedPrice hasDiscount discountPercent images",
      },
    });

    console.log("📦 Raw wishlist data:", wishlist);

    // ✅ Return empty array instead of throwing error
    if (!wishlist) {
      console.log("📋 No wishlist found, returning empty array");
      return [];
    }

    console.log("🔍 Wishlist products array length:", wishlist.products.length);

    // ✅ Log variant information for debugging
    wishlist.products.forEach((product: any, index: number) => {
      console.log(
        `📦 Product ${index}: ${product.name} - Variants: ${
          product.variants?.length || 0
        }`
      );
    });

    // ✅ Filter out any null/undefined products (safety check)
    const validProducts = wishlist.products.filter(
      (product) => product != null
    );

    console.log("✅ Returning products:", validProducts.length);
    return validProducts;
  }
}
export const wishlistService = new WishlistService();
