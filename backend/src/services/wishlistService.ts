import { Types } from "mongoose";
import { Wishlist } from "../models/wishlist.models";
import { AppError } from "../utils/AppError";

class WishlistService {
  /* ================= ADD ================= */
  async addToWishlist(userId: string, productId: string, variantId: string) {
    if (!productId || !variantId) {
      throw new AppError("productId and variantId required", 400);
    }

    const result = await Wishlist.findOneAndUpdate(
      { user: userId },
      {
        $addToSet: {
          items: {
            product: new Types.ObjectId(productId),
            variantId: new Types.ObjectId(variantId),
          },
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    if (!result) {
      throw new AppError("Unable to add to wishlist", 500);
    }

    return {
      productId,
      variantId,
    };
  }

  /* ================= REMOVE ================= */
  async removeFromWishlist(
    userId: string,
    productId: string,
    variantId: string
  ) {
    const result = await Wishlist.findOneAndUpdate(
      { user: userId },
      {
        $pull: {
          items: {
            product: new Types.ObjectId(productId),
            variantId: new Types.ObjectId(variantId),
          },
        },
      },
      { new: true }
    );

    if (!result) {
      throw new AppError("Wishlist not found", 404);
    }

    return {
      productId,
      variantId,
    };
  }

  /* ================= SIMPLE LIST (Navbar / Badge) ================= */
  async getWishlist(userId: string) {
    const wishlist = await Wishlist.findOne({ user: userId }, { items: 1 });

    if (!wishlist) return [];

    return wishlist.items.map((item) => ({
      productId: item.product.toString(),
      variantId: item.variantId.toString(),
    }));
  }

  /* ================= FULL DATA (Wishlist Page) ================= */
  async getWishlistWithProducts(userId: string) {
    const wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: "items.product",
      select: `
        name
        slug
        title
        category
        image
        sellingPrice
        listingPrice
        discountPercent
        variants
      `,
    });

    if (!wishlist) return [];

    return wishlist.items
      .filter((item) => item.product)
      .map((item) => ({
        product: item.product,
        variantId: item.variantId.toString(),
      }));
  }
  /* ================= CHECK (Optional API) ================= */
  // async isInWishlist(userId: string, productId: string, variantId: string) {
  //   const wishlist = await Wishlist.findOne({
  //     user: userId,
  //     items: {
  //       $elemMatch: {
  //         product: new Types.ObjectId(productId),
  //         variantId: new Types.ObjectId(variantId),
  //       },
  //     },
  //   });

  //   return { isWishlisted: !!wishlist };
  // }
}

export const wishlistService = new WishlistService();
