import { Response } from "express";
import { wishlistService } from "../services/wishlistService";
import { AuthRequest } from "../types/app-request";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";

export const addToWishlist = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    const { productId } = req.body;
    if (!userId) throw new AppError("userId not found", 403);
    const wishlist = await wishlistService.addToWishlist(userId, productId);
    res
      .status(200)
      .json(new ApiResponse(200, wishlist, "Product added to wishlist"));
  }
);

export const removeFromWishlist = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    const { productId } = req.body;
    if (!userId) throw new AppError("User not authenticated", 403);

    const result = await wishlistService.removeFromWishlist(userId, productId);
    res
      .status(200)
      .json(new ApiResponse(200, result, "Product removed from wishlist"));
  }
);

export const getWishlist = catchAsync(
  async (req: AuthRequest, res: Response) => {
    console.log("reaced getWishlist");
    const userId = req.userId;
    if (!userId) throw new AppError("User not authenticated", 403);

    const result = await wishlistService.getWishlist(userId);
    res
      .status(200)
      .json(new ApiResponse(200, result, "Wishlist fetched successfully"));
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

export const isInWishlist = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    const { productId } = req.query;
    if (!userId) throw new AppError("User not authenticated", 403);
    if (!productId || typeof productId !== "string")
      throw new AppError("Invalid productId", 400);

    const result = await wishlistService.isInWishlist(userId, productId);
    res.status(200).json(new ApiResponse(200, result, "Check successful"));
  }
);
