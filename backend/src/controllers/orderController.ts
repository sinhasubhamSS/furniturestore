import { Response } from "express";
import OrderService from "../services/orderService";
import { AuthRequest } from "../types/app-request";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";
import { paymentService } from "../services/paymentService";
import { OrderStatus } from "../models/order.models";
import { Order } from "../models/order.models";
import { Return } from "../models/return.models";
const orderService = new OrderService();

export const placeOrder = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }
    const idempotencyKey = req.headers["idempotency-key"] as string;
    if (idempotencyKey && typeof idempotencyKey !== "string") {
      throw new AppError("Invalid idempotency key format", 400);
    }

    const order = await orderService.placeOrder(
      userId,
      req.body,
      idempotencyKey
    );

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          orderId: order.orderId,
          idempotencyKey: order.idempotencyKey,
          payment: order.paymentSnapshot,
          items: order.orderItemsSnapshot,
          totalAmount: order.totalAmount,
        },
        "Order placed successfully"
      )
    );
  }
);

// ✅ UPDATED: getMyOrders with pagination support
export const getMyOrders = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    if (!userId) {
      throw new AppError("Unauthorized", 401);
    }

    // ✅ ADD: Pagination parameters
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    // ✅ UPDATED: Service now returns pagination data
    const result = await orderService.getMyOrders(userId, page, limit);
    console.log(result);

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Fetched user orders successfully"));
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

// ✅ UPDATED: Add tracking info support
export const updateOrderStatusController = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { orderId } = req.params;
    const { status, trackingInfo } = req.body; // ✅ ADD: trackingInfo

    if (!orderId || !status) {
      throw new AppError("Order ID and status are required", 400);
    }

    if (!Object.values(OrderStatus).includes(status)) {
      throw new AppError("Invalid order status", 400);
    }

    // ✅ UPDATED: Pass trackingInfo to service
    const updatedOrder = await orderService.updateOrderStatus(
      orderId,
      status as OrderStatus,
      trackingInfo // ✅ ADD: trackingInfo parameter
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          orderId: updatedOrder._id,
          status: updatedOrder.status,
          trackingInfo: updatedOrder.deliverySnapshot?.trackingId
            ? {
                trackingId: updatedOrder.deliverySnapshot.trackingId,
                courierPartner: updatedOrder.deliverySnapshot.courierPartner,
                estimatedDelivery:
                  updatedOrder.deliverySnapshot.estimatedDelivery,
              }
            : null,
        },
        `Order status updated to ${updatedOrder.status}`
      )
    );
  }
);

export const getCheckoutPricing = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { items, pincode } = req.body;

    // Simple validation
    if (!items?.length) {
      throw new AppError("Items required", 400);
    }
    if (!pincode) {
      throw new AppError("Pincode required", 400);
    }

    try {
      const pricingData = await orderService.calculateDisplayPricing(
        items,
        pincode
      );

      return res
        .status(200)
        .json(
          new ApiResponse(
            200,
            pricingData,
            pricingData.isServiceable
              ? "Pricing calculated successfully"
              : "Pricing calculated. Delivery not available for this pincode"
          )
        );
    } catch (error: any) {
      console.error("Pricing calculation error:", error.message);

      if (error instanceof AppError) {
        return res
          .status(error.statusCode)
          .json(new ApiResponse(error.statusCode, null, error.message));
      }

      return res
        .status(500)
        .json(new ApiResponse(500, null, "Internal server error"));
    }
  }
);
export const getAllOrdersAdmin = catchAsync(
  async (req: AuthRequest, res: Response) => {
    console.log("=== DEBUG: getAllOrdersAdmin called ===");
    console.log("Query params:", req.query);

    const {
      page = 1,
      limit = 20,
      status,
      search,
      startDate,
      endDate,
    } = req.query;

    try {
      // ✅ Use OrderService instead of direct DB calls
      const result = await orderService.getAllOrdersAdmin(
        Number(page),
        Number(limit),
        status as string,
        startDate as string,
        endDate as string,
        search as string
      );

      console.log("Service returned:", result);

      return res.status(200).json(
        new ApiResponse(
          200,
          result, // Service already returns { orders, pagination }
          "Orders fetched successfully"
        )
      );
    } catch (error: any) {
      console.error("=== ERROR in getAllOrdersAdmin Controller ===");
      console.error("Error:", error.message);
      console.error("Stack:", error.stack);

      return res
        .status(500)
        .json(
          new ApiResponse(500, null, `Internal server error: ${error.message}`)
        );
    }
  }
);
