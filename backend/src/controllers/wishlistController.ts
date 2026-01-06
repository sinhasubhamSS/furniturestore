import { Response } from "express";
import { wishlistService } from "../services/wishlistService";
import { AuthRequest } from "../types/app-request";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";

export const addToWishlist = catchAsync(
  async (req: AuthRequest, res: Response) => {
    console.log("reached add to wishlist controller");
    const userId = req.userId;
    const { productId, variantId } = req.body;

    if (!userId) throw new AppError("userId not found", 403);
    console.log("activate add to wishlist ", variantId);
    const wishlist = await wishlistService.addToWishlist(
      userId,
      productId,
      variantId
    );
    res
      .status(200)
      .json(new ApiResponse(200, wishlist, "Product added to wishlist"));
  }
);

export const removeFromWishlist = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    const { productId, variantId } = req.body;
    if (!userId) throw new AppError("User not authenticated", 403);

    const result = await wishlistService.removeFromWishlist(
      userId,
      productId,
      variantId
    );
    res
      .status(200)
      .json(new ApiResponse(200, result, "Product removed from wishlist"));
  }
);

export const getWishlist = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;

    if (!userId) {
      return res.status(200).json(new ApiResponse(200, { items: [] }, "OK"));
    }

    const items = await wishlistService.getWishlist(userId);

    return res
      .status(200)
      .json(new ApiResponse(200, { items }, "Wishlist fetched successfully"));
  }
);

export const getWishlistWithProducts = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) throw new AppError("User not authenticated", 403);

    const result = await wishlistService.getWishlistWithProducts(userId);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          result,
          "Wishlist with products fetched successfully"
        )
      );
  }
);

// export const isInWishlist = catchAsync(
//   async (req: AuthRequest, res: Response) => {
//     const userId = req.userId;
//     const { productId, variantId } = req.body;
//     if (!userId) throw new AppError("User not authenticated", 403);
//     if (!productId || typeof productId !== "string")
//       throw new AppError("Invalid productId", 400);

//     const result = await wishlistService.isInWishlist(
//       userId,
//       productId,
//       variantId
//     );
//     res.status(200).json(new ApiResponse(200, result, "Check successful"));
//   }
// );
