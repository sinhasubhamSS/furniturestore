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
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          { orderId: order._id },
          "Order placed successfully"
        )
      );
  }
);
