import { Order } from "../models/order.models";
import {
  Return,
  ReturnDocument,
  ReturnStatus,
  generateReturnId,
} from "../models/return.models";
import { AppError } from "../utils/AppError";
import { Types } from "mongoose";

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

export class ReturnService {
  // ✅ 1. Create Return Request
  async createReturnRequest(returnData: CreateReturnInput): Promise<{
    return: ReturnDocument;
    refundAmount: number;
  }> {
    try {
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

      // Check if return window is still open (e.g., 7 days)
      const returnWindow = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
      const deliveryDate = order.trackingInfo?.actualDelivery || order.placedAt;
      const currentDate = new Date();

      if (currentDate.getTime() - deliveryDate.getTime() > returnWindow) {
        throw new AppError("Return window has expired", 400);
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

      // Generate return ID
      const returnId = await generateReturnId();

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

  // ✅ 2. Get User Returns
  async getUserReturns(
    userId: Types.ObjectId,
    page: number = 1,
    limit: number = 10
  ) {
    try {
      const skip = (page - 1) * limit;

      const returns = await Return.find({ user: userId })
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("order", "orderId totalAmount placedAt")
        .lean();

      const total = await Return.countDocuments({ user: userId });

      return {
        returns,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
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
        query.user = userId; // Ensure user can only see their own returns
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

  // ✅ 4. Update Return Status (Admin)
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

      returnDoc.status = status;

      // Set timestamps based on status
      if (status === ReturnStatus.Processed) {
        returnDoc.processedAt = new Date();
        returnDoc.refundProcessedAt = new Date();
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

  // ✅ 5. Get All Returns (Admin)
  async getAllReturns(
    page: number = 1,
    limit: number = 10,
    status?: ReturnStatus
  ) {
    try {
      const skip = (page - 1) * limit;
      const query: any = {};

      if (status) {
        query.status = status;
      }

      const returns = await Return.find(query)
        .sort({ requestedAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("user", "name email")
        .populate("order", "orderId totalAmount")
        .lean();

      const total = await Return.countDocuments(query);

      return {
        returns,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
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

  // ✅ 7. Get Return Analytics (Admin)
  async getReturnAnalytics() {
    try {
      const analytics = await Return.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            totalRefundAmount: { $sum: "$refundAmount" },
          },
        },
        {
          $sort: { count: -1 },
        },
      ]);

      const totalReturns = await Return.countDocuments();
      const totalRefundAmount = await Return.aggregate([
        { $group: { _id: null, total: { $sum: "$refundAmount" } } },
      ]);

      return {
        analytics,
        totalReturns,
        totalRefundAmount: totalRefundAmount[0]?.total || 0,
      };
    } catch (error: any) {
      throw new AppError(
        `Failed to fetch return analytics: ${error.message}`,
        500
      );
    }
  }
}
