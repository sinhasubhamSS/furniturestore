import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AuthRequest } from "../types/app-request";
import { ApiResponse } from "../utils/ApiResponse";
import { cartService } from "../services/cartService";

export const addToCart = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { productId, quantity } = req.body;
  if (!userId) throw new Error("User not authenticated");
  const product = await cartService.addToCart(userId, productId, quantity);
  res.status(200).json(new ApiResponse(200, product, "product added to cart"));
});
export const getCart = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  if (!userId) throw new Error("User not authenticated");
  const cart = await cartService.getCart(userId);
  res.status(200).json(new ApiResponse(200, cart, "cart fetched"));
});
export const updateQuantity = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    const { productId, quantity } = req.body;
    if (!userId) throw new Error("User not authenticated");
    const product = await cartService.updateQuantity(
      userId,
      productId,
      quantity
    );
    res
      .status(200)
      .json(new ApiResponse(200, product, "product quantity updated"));
  }
);
export const removeItem = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    const { productId } = req.body;
    if (!userId) throw new Error("User not authenticated");
    const product = await cartService.removeItem(userId, productId);
    res
      .status(200)
      .json(new ApiResponse(200, product, "product removed"));
  }
);
export const clearCart = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) throw new Error("User not authenticated");
  const product = await cartService.clearCart(userId);
  res
    .status(200)
    .json(new ApiResponse(200, product, "cart cleared"));
});
export const getCartCount = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;

    if (!userId) throw new Error("User not authenticated");
    const product = await cartService.getCartCount(userId);
    res
      .status(200)
      .json(new ApiResponse(200, product, "got cart count "));
  }
);
