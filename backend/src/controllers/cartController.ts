import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { AuthRequest } from "../types/app-request";
import { ApiResponse } from "../utils/ApiResponse";
import { cartService } from "../services/cartService";
import { AppError } from "../utils/AppError";

// ✅ Add to cart with variant support
export const addToCart = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;
  const { productId, variantId, quantity } = req.body;

  if (!userId) throw new AppError("User not authenticated", 401);

  const cart = await cartService.addToCart(
    userId,
    productId,
    variantId,
    quantity
  );
  res.status(200).json(new ApiResponse(200, cart, "Product added to cart"));
});

// ✅ Get cart
export const getCart = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) throw new AppError("User not authenticated", 401);

  const cart = await cartService.getCart(userId);
  res.status(200).json(new ApiResponse(200, cart, "Cart fetched successfully"));
});

// ✅ Update quantity with variant support
export const updateQuantity = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    const { productId, variantId, quantity } = req.body;

    if (!userId) throw new AppError("User not authenticated", 401);

    const cart = await cartService.updateQuantity(
      userId,
      productId,
      variantId,
      quantity
    );
    res
      .status(200)
      .json(new ApiResponse(200, cart, "Quantity updated successfully"));
  }
);

// ✅ Remove item with variant support
export const removeItem = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    const { productId, variantId } = req.body;

    if (!userId) throw new AppError("User not authenticated", 401);

    const cart = await cartService.removeItem(userId, productId, variantId);
    res.status(200).json(new ApiResponse(200, cart, "Item removed from cart"));
  }
);

// ✅ Clear cart
export const clearCart = catchAsync(async (req: AuthRequest, res: Response) => {
  const userId = req.userId;

  if (!userId) throw new AppError("User not authenticated", 401);

  const cart = await cartService.clearCart(userId);
  res.status(200).json(new ApiResponse(200, cart, "Cart cleared successfully"));
});

// ✅ Get cart count
export const getCartCount = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;

    if (!userId) throw new AppError("User not authenticated", 401);

    const count = await cartService.getCartCount(userId);
    res.status(200).json(new ApiResponse(200, { count }, "Cart count fetched"));
  }
);
