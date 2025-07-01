import { Response } from "express";

import OrderService from "../services/orderService";
import { AuthRequest } from "../types/app-request";
import { catchAsync } from "../utils/catchAsync";

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
