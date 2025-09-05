import { Order, OrderStatus } from "../models/order.models";
import { Return, ReturnDocument, ReturnStatus } from "../models/return.models";
import { AppError } from "../utils/AppError";
import { Types } from "mongoose";

// ✅ Import new utilities
import { ValidationUtils } from "../utils/validators";
import { IDGenerator } from "../utils/IDGenerator";
import { StatusManager } from "../utils/statusManger";
import { PaginationService } from "./PaginationService";
import { BUSINESS_RULES } from "../constants/Bussiness";

export interface CreateReturnInput {
  orderId: string;
  userId: Types.ObjectId;
  returnItems: {
    orderItemIndex: number;
    quantity: number;
    reason: string;
    condition: "unopened" | "used" | "damaged";
  }[];
  returnReason: string;
}
export type ReturnStatusFilter = ReturnStatus | "all";
export class ReturnService {
  // ✅ Return status transition rules
  private allowedTransitions: Record<ReturnStatus, ReturnStatus[]> = {
    [ReturnStatus.Requested]: [ReturnStatus.Approved, ReturnStatus.Rejected],
    [ReturnStatus.Approved]: [ReturnStatus.PickedUp, ReturnStatus.Rejected],
    [ReturnStatus.PickedUp]: [ReturnStatus.Received],
    [ReturnStatus.Received]: [ReturnStatus.Processed],
    [ReturnStatus.Processed]: [],
    [ReturnStatus.Rejected]: [],
  };

  // ✅ 1. Create Return Request
  async createReturnRequest(returnData: CreateReturnInput): Promise<{
    return: ReturnDocument;
    refundAmount: number;
  }> {
    try {
      // ✅ Use ValidationUtils
      ValidationUtils.validateObjectId(returnData.userId.toString(), "User ID");

      // Validate order exists and belongs to user
      const order = await Order.findOne({
        orderId: returnData.orderId,
        user: returnData.userId,
      });

      if (!order) {
        throw new AppError("Order not found or access denied", 404);
      }

      // Check if order is eligible for return (delivered status)
      if (order.status !== "delivered") {
        throw new AppError("Only delivered orders can be returned", 400);
      }

      // ✅ Use BUSINESS_RULES constant and ValidationUtils
      const deliveryDate = order.trackingInfo?.actualDelivery || order.placedAt;
      if (
        !ValidationUtils.validateReturnWindow(
          deliveryDate,
          BUSINESS_RULES.RETURN_WINDOW_DAYS
        )
      ) {
        throw new AppError(
          `Return window of ${BUSINESS_RULES.RETURN_WINDOW_DAYS} days has expired`,
          400
        );
      }

      // Validate return items and calculate refund amount
      let refundAmount = 0;
      for (const returnItem of returnData.returnItems) {
        const orderItem = order.orderItemsSnapshot[returnItem.orderItemIndex];

        if (!orderItem) {
          throw new AppError(
            `Invalid item index: ${returnItem.orderItemIndex}`,
            400
          );
        }

        if (returnItem.quantity > orderItem.quantity) {
          throw new AppError(
            `Cannot return ${returnItem.quantity} items, only ${orderItem.quantity} were ordered`,
            400
          );
        }

        // Calculate refund amount from snapshot data
        refundAmount += orderItem.price * returnItem.quantity;
      }

      // Check if return already exists for this order
      const existingReturn = await Return.findOne({
        orderId: returnData.orderId,
      });
      if (existingReturn) {
        throw new AppError("Return request already exists for this order", 400);
      }

      // ✅ Use IDGenerator
      const returnId = await IDGenerator.generateReturnId(Return);

      // Create return request
      const returnRequest = new Return({
        returnId,
        orderId: returnData.orderId,
        user: returnData.userId,
        returnItems: returnData.returnItems,
        returnReason: returnData.returnReason,
        refundAmount,
        status: ReturnStatus.Requested,
      });

      const savedReturn = await returnRequest.save();

      return {
        return: savedReturn,
        refundAmount,
      };
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(
        `Failed to create return request: ${error.message}`,
        500
      );
    }
  }

  // ✅ 2. Get User Returns with PaginationService
  async getUserReturns(
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      // ✅ Use ValidationUtils
      const { page: validPage, limit: validLimit } =
        ValidationUtils.validatePagination(page, limit);

      const result = await PaginationService.paginate(
        Return,
        { user: userId },
        validPage,
        validLimit,
        {
          populate: "order",
          sort: { requestedAt: -1 },
        }
      );

      return {
        returns: result.data,
        pagination: result.pagination,
      };
    } catch (error: any) {
      throw new AppError(`Failed to fetch user returns: ${error.message}`, 500);
    }
  }

  // ✅ 3. Get Return by ID
  async getReturnById(
    returnId: string,
    userId?: Types.ObjectId
  ): Promise<ReturnDocument> {
    try {
      const query: any = { returnId };
      if (userId) {
        query.user = userId;
      }

      const returnDoc = await Return.findOne(query)
        .populate("user", "name email")
        .populate("order", "orderId totalAmount placedAt orderItemsSnapshot");

      if (!returnDoc) {
        throw new AppError("Return not found", 404);
      }

      return returnDoc;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to fetch return: ${error.message}`, 500);
    }
  }

  // ✅ 4. Update Return Status (Admin) with StatusManager
async updateReturnStatus(
  returnId: string,
  status: ReturnStatus,
  adminNotes?: string
): Promise<ReturnDocument> {
  try {
    const returnDoc = await Return.findOne({ returnId });

    if (!returnDoc) {
      throw new AppError("Return not found", 404);
    }

    // ✅ Use StatusManager for validation
    StatusManager.validateTransition(
      returnDoc.status,
      status,
      this.allowedTransitions,
      "Return"
    );

    returnDoc.status = status;

    // ✅ Add admin notes if provided
    if (adminNotes) {
      returnDoc.adminNotes= adminNotes;
    }

    // Set timestamps based on status
    if (status === ReturnStatus.Processed) {
      returnDoc.processedAt = new Date();
      returnDoc.refundProcessedAt = new Date();
      
      // ✅ NEW: Update Order Status when return is processed
      await this.updateOrderStatusOnReturn(returnDoc.orderId);
      
    } else if (status === ReturnStatus.Received) {
      returnDoc.processedAt = new Date();
    }

    const updatedReturn = await returnDoc.save();

    return updatedReturn;
  } catch (error: any) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Failed to update return status: ${error.message}`,
      500
    );
  }
}

// ✅ NEW Helper Method: Update Order Status on Return Processing
private async updateOrderStatusOnReturn(orderId: string): Promise<void> {
  try {
    const order = await Order.findOne({ orderId });
    
    if (!order) {
      console.warn(`Order ${orderId} not found for return processing`);
      return;
    }

    // Only update order status if it's currently delivered
    if (order.status === OrderStatus.Delivered) {
      order.status = OrderStatus.Refunded;
      await order.save();
      
      console.log(`✅ Order ${orderId} marked as refunded after return processing`);
    } else {
      console.log(`⚠️ Order ${orderId} status is ${order.status}, not updating to refunded`);
    }
  } catch (error) {
    console.error(`Error updating order status for ${orderId}:`, error);
    // Don't throw error here - return processing should continue even if order update fails
  }
}


  // ✅ 5. Get All Returns (Admin) with PaginationService
  async getAllReturns(
    page: number = 1,
    limit: number = 10,
    status?: ReturnStatus
  ) {
    try {
      // ✅ Use ValidationUtils
      const { page: validPage, limit: validLimit } =
        ValidationUtils.validatePagination(page, limit);

      const query: any = {};
      if (status) {
        query.status = status;
      }

      const result = await PaginationService.paginate(
        Return,
        query,
        validPage,
        validLimit,
        {
          populate: ["user", "order"],
          sort: { requestedAt: -1 },
        }
      );

      return {
        returns: result.data,
        pagination: result.pagination,
      };
    } catch (error: any) {
      throw new AppError(`Failed to fetch returns: ${error.message}`, 500);
    }
  }

  // ✅ 6. Cancel Return Request (User)
  async cancelReturnRequest(
    returnId: string,
    userId: Types.ObjectId
  ): Promise<void> {
    try {
      const returnDoc = await Return.findOne({
        returnId,
        user: userId,
      });

      if (!returnDoc) {
        throw new AppError("Return not found or access denied", 404);
      }

      if (returnDoc.status !== ReturnStatus.Requested) {
        throw new AppError("Can only cancel requested returns", 400);
      }

      await Return.findByIdAndDelete(returnDoc._id);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      throw new AppError(`Failed to cancel return: ${error.message}`, 500);
    }
  }

  // ReturnService में add करें:

  async getAllReturnsAdmin(
    page: number = 1,
    limit: number = 20,
   status?: ReturnStatusFilter,
    startDate?: string,
    endDate?: string,
    search?: string
  ) {
    const { page: validPage, limit: validLimit } =
      ValidationUtils.validatePagination(page, limit);

   const filter: any = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (startDate && endDate) {
      filter.requestedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (search) {
      filter.$or = [
        { returnId: { $regex: search, $options: "i" } },
        { orderId: { $regex: search, $options: "i" } },
      ];
    }

    return await PaginationService.paginate(
      Return,
      filter,
      validPage,
      validLimit,
      {
        populate: ["user", "order"],
        sort: { requestedAt: -1 },
      }
    );
  }

  // Enhanced analytics with date filters
  async getReturnAnalyticsByDate(startDate?: string, endDate?: string) {
    const dateFilter:any = {};
    if (startDate && endDate) {
      dateFilter.requestedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const analytics = await Return.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalRefundAmount: { $sum: "$refundAmount" },
          averageRefund: { $avg: "$refundAmount" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    return {
      analytics,
      totalReturns: await Return.countDocuments(dateFilter),
      summary: {
        pendingReturns: await Return.countDocuments({
          ...dateFilter,
          status: "requested",
        }),
        approvedReturns: await Return.countDocuments({
          ...dateFilter,
          status: "approved",
        }),
        processedReturns: await Return.countDocuments({
          ...dateFilter,
          status: "processed",
        }),
      },
    };
  }

  // ✅ 8. Get Next Allowed Statuses (Admin Helper)
  getNextAllowedStatuses(currentStatus: ReturnStatus): ReturnStatus[] {
    return StatusManager.getNextAllowedStatuses(
      currentStatus,
      this.allowedTransitions
    );
  }
}
