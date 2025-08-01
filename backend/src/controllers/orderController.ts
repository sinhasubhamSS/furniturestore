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
      // Throwing AppError lets your error middleware format the error
      throw new AppError("Unauthorized", 401);
    }

    const order = await orderService.placeOrder(userId, req.body);

    // Use ApiResponse for consistent, structured success output
    return res.status(201).json(
      new ApiResponse(
        201,
        {
          orderId: order._id,
          payment: order.paymentSnapshot,
          items: order.orderItemsSnapshot,
          totalAmount: order.totalAmount,
        },
        "Order placed successfully"
      )
    );
  }
);
export const getMyOrders = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    const orders = await orderService.getMyOrders(userId);

    return res
      .status(200)
      .json(new ApiResponse(200, orders, "Fetched user orders successfully"));
  }
);
// Controller handler
export const cancelOrderController = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId; // assume authentication middleware sets this
    const { orderId } = req.body;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    if (!orderId) {
      throw new AppError("Order ID is required", 400);
    }

    // Call service method
    const result = await orderService.cancelOrder(userId, orderId);

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Order cancelled successfully"));
  }
);
