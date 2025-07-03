import { Response } from "express";

import OrderService from "../services/orderService";
import { AuthRequest } from "../types/app-request";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";

const orderService = new OrderService();

export const placeOrder = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const order = await orderService.placeOrderFromProductPage(
      userId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      orderId: order._id,
    });
  }
);
export const placeOrderFromCart = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;

    if (!userId) {
      throw new AppError("Unauthorized access", 401);
    }

    const { shippingAddress, payment } = req.body;

    if (!shippingAddress || !payment) {
      throw new AppError(
        "Shipping address and payment details are required",
        400
      );
    }

    const orderData = { items: [], shippingAddress, payment };
    const order = await orderService.placeOrderFromCart(userId, orderData);

    const apiResponse = new ApiResponse(
      201,
      order,
      "Order placed successfully"
    );
    res.status(201).json(apiResponse);
  }
);
