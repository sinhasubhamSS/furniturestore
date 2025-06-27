import { Response, NextFunction } from "express";
import { orderService } from "../services/orderService";
import { ApiResponse } from "../utils/ApiResponse";
import { PaymentMethod } from "../models/order.models";
import { AuthRequest } from "../types/app-request";

export const buyNowOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;

    const { productId, quantity, address, paymentMethod } = req.body;
    if (!userId) {
      return next(new Error("User ID is missing from request"));
    }
    const order = await orderService.createOrder(userId, "buy-now", {
      productId,
      quantity,
      address,
      paymentMethod,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, order, "Order placed successfully"));
  } catch (error) {
    next(error);
  }
};

export const buyAllCartOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    const { address, paymentMethod } = req.body;
    if (!userId) {
      return next(new Error("User ID is missing from request"));
    }
    const order = await orderService.createOrder(userId, "cart-all", {
      address,
      paymentMethod,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, order, "Order placed from full cart"));
  } catch (error) {
    next(error);
  }
};

export const buySelectedCartOrder = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    const { selectedIds, address, paymentMethod } = req.body;
    if (!userId) {
      return next(new Error("User ID is missing from request"));
    }
    const order = await orderService.createOrder(userId, "cart-selected", {
      selectedIds,
      address,
      paymentMethod,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, order, "Selected cart items ordered"));
  } catch (error) {
    next(error);
  }
};
