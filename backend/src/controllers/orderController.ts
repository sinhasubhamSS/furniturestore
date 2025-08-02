import { Response } from "express";
import OrderService from "../services/orderService";
import { AuthRequest } from "../types/app-request";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";
import { paymentService } from "../services/paymentService";
import { OrderStatus } from "../models/order.models";

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

export const cancelOrderController = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    const { orderId } = req.body;

    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    if (!orderId) {
      throw new AppError("Order ID is required", 400);
    }

    const result = await orderService.cancelOrder(userId, orderId);

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Order cancelled successfully"));
  }
);

// New: Update Order Status Controller
export const updateOrderStatusController = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!orderId || !status) {
      throw new AppError("Order ID and status are required", 400);
    }

    if (!Object.values(OrderStatus).includes(status)) {
      throw new AppError("Invalid order status", 400);
    }

    const updatedOrder = await orderService.updateOrderStatus(
      orderId,
      status as OrderStatus
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          orderId: updatedOrder._id,
          status: updatedOrder.status,
        },
        `Order status updated to ${updatedOrder.status}`
      )
    );
  }
);