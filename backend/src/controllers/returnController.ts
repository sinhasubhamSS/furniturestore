import { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/ApiResponse";
import { AppError } from "../utils/AppError";
import { ReturnService, CreateReturnInput } from "../services/returnService";
import { Types } from "mongoose";
import { ReturnStatus } from "../models/return.models";
import { AuthRequest } from "../types/app-request";
import { Order } from "../models/order.models";
// ✅ ADD: Import BUSINESS_RULES
import { BUSINESS_RULES } from "../constants/Bussiness";

const returnService = new ReturnService();

export class ReturnController {
  // ✅ All other methods remain same...

  // ✅ UPDATED: checkReturnEligibility with BUSINESS_RULES
  checkReturnEligibility = catchAsync(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const { orderId } = req.params;
      const userId = req.userId;

      if (!userId) {
        throw new AppError("Authentication required", 401);
      }

      const order = await Order.findOne({
        orderId,
        user: new Types.ObjectId(userId),
      });

      if (!order) {
        throw new AppError("Order not found", 404);
      }

      const isEligible = order.status === "delivered";

      // ✅ UPDATED: Use BUSINESS_RULES constant instead of hardcoded 7 days
      const returnWindowMs =
        BUSINESS_RULES.RETURN_WINDOW_DAYS * 24 * 60 * 60 * 1000;
      const deliveryDate = order.trackingInfo?.actualDelivery || order.placedAt;
      const timeRemaining =
        returnWindowMs - (new Date().getTime() - deliveryDate.getTime());
      const isWithinWindow = timeRemaining > 0;

      res.status(200).json(
        new ApiResponse(
          200,
          {
            isEligible: isEligible && isWithinWindow,
            order,
            timeRemaining: Math.max(0, timeRemaining),
            returnWindowDays: BUSINESS_RULES.RETURN_WINDOW_DAYS, // ✅ ADD: Show return window
            reason: !isEligible
              ? "Order must be delivered to be eligible for return"
              : !isWithinWindow
              ? `Return window of ${BUSINESS_RULES.RETURN_WINDOW_DAYS} days has expired`
              : "Order is eligible for return",
          },
          "Return eligibility checked"
        )
      );
    }
  );

  // ✅ ADD: Get Next Allowed Statuses (Admin Helper)
  getNextAllowedStatuses = catchAsync(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const { returnId } = req.params;

      if (req.user?.role !== "admin") {
        throw new AppError("Admin access required", 403);
      }

      const returnDoc = await returnService.getReturnById(returnId);
      const nextStatuses = returnService.getNextAllowedStatuses(
        returnDoc.status
      );

      res.status(200).json(
        new ApiResponse(
          200,
          {
            currentStatus: returnDoc.status,
            nextAllowedStatuses: nextStatuses,
          },
          "Next allowed statuses fetched successfully"
        )
      );
    }
  );

  // All other methods remain exactly the same...
  createReturnRequest = catchAsync(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const { orderId, returnItems, returnReason } = req.body;
      const userId = req.userId;

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

  getReturnById = catchAsync(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const { returnId } = req.params;
      const userId = req.userId;

      if (!returnId) {
        throw new AppError("Return ID is required", 400);
      }

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

  updateReturnStatus = catchAsync(
    async (req: AuthRequest, res: Response): Promise<void> => {
      const { returnId } = req.params;
      const { status, adminNotes } = req.body;

      if (req.user?.role !== "admin") {
        throw new AppError("Admin access required", 403);
      }

      if (!returnId || !status) {
        throw new AppError("Return ID and status are required", 400);
      }

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

  getAllReturns = catchAsync(
    async (req: AuthRequest, res: Response): Promise<void> => {
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

  getAllReturnsAdmin = catchAsync(async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "admin") {
      throw new AppError("Admin access required", 403);
    }

    const {
      page = 1,
      limit = 20,
      status,
      search,
      startDate,
      endDate,
    } = req.query;

    const result = await returnService.getAllReturnsAdmin(
      Number(page),
      Number(limit),
      status as ReturnStatus,
      startDate as string,
      endDate as string,
      search as string
    );

    return res
      .status(200)
      .json(new ApiResponse(200, result, "Returns fetched successfully"));
  });

  getReturnAnalytics = catchAsync(async (req: AuthRequest, res: Response) => {
    if (req.user?.role !== "admin") {
      throw new AppError("Admin access required", 403);
    }

    const { startDate, endDate } = req.query;

    const analytics = await returnService.getReturnAnalyticsByDate(
      startDate as string,
      endDate as string
    );

    return res
      .status(200)
      .json(
        new ApiResponse(200, analytics, "Return analytics fetched successfully")
      );
  });
}
