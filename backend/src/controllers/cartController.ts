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
