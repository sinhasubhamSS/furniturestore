import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/ApiResponse";
import { AppError } from "../utils/AppError";
import { ReturnService, CreateReturnInput } from "../services/returnService";
import { Types } from "mongoose";
import { ReturnStatus } from "../models/return.models";
import { AuthRequest } from "../types/app-request";
import { Order } from "../models/order.models";

const returnService = new ReturnService();

export class ReturnController {
  // ✅ 1. Create Return Request
  createReturnRequest = catchAsync(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const { orderId, returnItems, returnReason } = req.body;
      const userId = req.userId; // Assuming auth middleware sets req.user

      if (!userId) {
        throw new AppError("Authentication required", 401);
      }

      if (!orderId || !returnItems || !returnReason) {
        throw new AppError(
          "Order ID, return items, and return reason are required",
          400
        );
      }

      if (!Array.isArray(returnItems) || returnItems.length === 0) {
        throw new AppError("At least one return item is required", 400);
      }

      // Validate return items structure
      for (const item of returnItems) {
        if (
          typeof item.orderItemIndex !== "number" ||
          typeof item.quantity !== "number" ||
          !item.reason ||
          !item.condition
        ) {
          throw new AppError("Invalid return item structure", 400);
        }
      }

      const returnData: CreateReturnInput = {
        orderId,
        userId: new Types.ObjectId(userId),
        returnItems,
        returnReason,
      };

      const result = await returnService.createReturnRequest(returnData);

      res.status(201).json(
        new ApiResponse(
          201,
          {
            return: result.return,
            refundAmount: result.refundAmount,
          },
          "Return request created successfully"
        )
      );
    }
  );

  // ✅ 2. Get User Returns
  getUserReturns = catchAsync(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const userId = req.userId;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!userId) {
        throw new AppError("Authentication required", 401);
      }

      const result = await returnService.getUserReturns(
        new Types.ObjectId(userId),
        page,
        limit
      );

      res
        .status(200)
        .json(
          new ApiResponse(200, result, "User returns fetched successfully")
        );
    }
  );

  // ✅ 3. Get Return by ID
  getReturnById = catchAsync(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const { returnId } = req.params;
      const userId = req.userId;

      if (!returnId) {
        throw new AppError("Return ID is required", 400);
      }

      // For regular users, restrict to their own returns
      const userIdFilter =
        req.user?.role === "admin" ? undefined : new Types.ObjectId(userId);

      const returnDoc = await returnService.getReturnById(
        returnId,
        userIdFilter
      );

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { return: returnDoc },
            "Return fetched successfully"
          )
        );
    }
  );

  // ✅ 4. Update Return Status (Admin only)
  updateReturnStatus = catchAsync(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const { returnId } = req.params;
      const { status, adminNotes } = req.body;

      // Check admin role (assuming role-based auth)
      if (req.user?.role !== "admin") {
        throw new AppError("Admin access required", 403);
      }

      if (!returnId || !status) {
        throw new AppError("Return ID and status are required", 400);
      }

      // Validate status
      if (!Object.values(ReturnStatus).includes(status)) {
        throw new AppError("Invalid return status", 400);
      }

      const updatedReturn = await returnService.updateReturnStatus(
        returnId,
        status,
        adminNotes
      );

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { return: updatedReturn },
            "Return status updated successfully"
          )
        );
    }
  );

  // ✅ 5. Get All Returns (Admin only)
  getAllReturns = catchAsync(
    async (req: AuthRequest, res: Response): Promise<void> => {
      // Check admin role
      if (req.user?.role !== "admin") {
        throw new AppError("Admin access required", 403);
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const status = req.query.status as ReturnStatus;

      const result = await returnService.getAllReturns(page, limit, status);

      res
        .status(200)
        .json(new ApiResponse(200, result, "Returns fetched successfully"));
    }
  );

  // ✅ 6. Cancel Return Request
  cancelReturnRequest = catchAsync(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const { returnId } = req.params;
      const userId = req.userId;

      if (!userId) {
        throw new AppError("Authentication required", 401);
      }

      if (!returnId) {
        throw new AppError("Return ID is required", 400);
      }

      await returnService.cancelReturnRequest(
        returnId,
        new Types.ObjectId(userId)
      );

      res
        .status(200)
        .json(
          new ApiResponse(200, {}, "Return request cancelled successfully")
        );
    }
  );

  // ✅ 7. Get Return Analytics (Admin only)
  getReturnAnalytics = catchAsync(
    async (req: AuthRequest, res: Response): Promise<void> => {
      // Check admin role
      if (req.user?.role !== "admin") {
        throw new AppError("Admin access required", 403);
      }

      const analytics = await returnService.getReturnAnalytics();

      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            analytics,
            "Return analytics fetched successfully"
          )
        );
    }
  );

  // ✅ 8. Check Return Eligibility
  checkReturnEligibility = catchAsync(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const { orderId } = req.params;
      const userId = req.userId;
      console.log(orderId);
      console.log(userId);
      if (!userId) {
        throw new AppError("Authentication required", 401);
      }

      // This could be part of OrderService, but for simplicity keeping here
      const order = await Order.findOne({
        orderId,
        user: new Types.ObjectId(userId),
      });

      if (!order) {
        throw new AppError("Order not found", 404);
      }

      const isEligible = order.status === "delivered";
      const returnWindow = 7 * 24 * 60 * 60 * 1000; // 7 days
      const deliveryDate = order.trackingInfo?.actualDelivery || order.placedAt;
      const timeRemaining =
        returnWindow - (new Date().getTime() - deliveryDate.getTime());
      const isWithinWindow = timeRemaining > 0;

      res.status(200).json(
        new ApiResponse(
          200,
          {
            isEligible: isEligible && isWithinWindow,
            order,
            timeRemaining: Math.max(0, timeRemaining),
            reason: !isEligible
              ? "Order must be delivered to be eligible for return"
              : !isWithinWindow
              ? "Return window has expired"
              : "Order is eligible for return",
          },
          "Return eligibility checked"
        )
      );
    }
  );
}
