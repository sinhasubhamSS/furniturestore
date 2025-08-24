import { Schema, model, Document, Types } from "mongoose";

// ✅ Return status enum - Complete workflow covered
export enum ReturnStatus {
  Requested = "requested", // User ne return request kiya
  Approved = "approved", // Admin ne approve kiya
  Rejected = "rejected", // Admin ne reject kiya
  PickedUp = "picked_up", // Courier ne pickup kiyaQ
  Received = "received", // Warehouse me receive hua
  Processed = "processed", // Refund process complete
}

// ✅ Return item interface - Individual items being returned
export interface ReturnItem {
  orderItemIndex: number; // Index from order.orderItemsSnapshot
  quantity: number; // Kitni quantity return kar rahe hain
  reason: string; // Item-specific return reason
  condition: "unopened" | "used" | "damaged"; // Product condition
}

// ✅ Main Return document interface
export interface ReturnDocument extends Document {
  returnId: string; // RET-20250823-00001
  orderId: string; // Original order reference
  user: Types.ObjectId; // User who requested return
  returnItems: ReturnItem[]; // Items being returned
  returnReason: string; // Overall return reason
  refundAmount: number; // Calculated from snapshot prices
  status: ReturnStatus; // Current status
  requestedAt: Date; // When return was requested
  processedAt?: Date; // When return was processed
  refundProcessedAt?: Date; // When refund was processed
}

// ✅ Return item schema - Nested schema for return items
const returnItemSchema = new Schema<ReturnItem>({
  orderItemIndex: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  reason: {
    type: String,
    required: true,
    maxlength: 500,
  },
  condition: {
    type: String,
    enum: ["unopened", "used", "damaged"],
    required: true,
  },
});

// ✅ Main return schema
const returnSchema = new Schema<ReturnDocument>(
  {
    returnId: {
      type: String,
      unique: true,
      required: true,
      index: true,
    },
    orderId: {
      type: String,
      required: true,
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    returnItems: {
      type: [returnItemSchema],
      required: true,
      validate: {
        validator: function (items: ReturnItem[]) {
          return items && items.length > 0;
        },
        message: "At least one item is required for return",
      },
    },
    returnReason: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    refundAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(ReturnStatus),
      default: ReturnStatus.Requested,
      index: true,
    },
    requestedAt: {
      type: Date,
      default: () => new Date(),
      index: true,
    },
    processedAt: Date,
    refundProcessedAt: Date,
  },
  {
    timestamps: true,
    // ✅ Add virtual for easy population
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Indexes for better performance


returnSchema.index({ user: 1, requestedAt: -1 }); // User's recent returns
returnSchema.index({ status: 1, requestedAt: -1 }); // Admin filter by status

// ✅ Virtual for order reference (optional)
returnSchema.virtual("order", {
  ref: "Order",
  localField: "orderId",
  foreignField: "orderId",
  justOne: true,
});

// ✅ Pre-save hook for returnId generation
returnSchema.pre("save", async function (next) {
  if (!this.returnId) {
    this.returnId = await generateReturnId();
  }
  next();
});

// ✅ Export the model
export const Return = model<ReturnDocument>("Return", returnSchema);

// ✅ Helper function to generate unique return ID
export async function generateReturnId(): Promise<string> {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, ""); // 20250823

  // Count today's returns for sequence
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const todayCount = await Return.countDocuments({
    requestedAt: { $gte: startOfDay, $lt: endOfDay },
  });

  const sequence = (todayCount + 1).toString().padStart(5, "0"); // 00001
  return `RET-${dateStr}-${sequence}`; // RET-20250823-00001
}

// ✅ Export return reasons (optional constants)
export const RETURN_REASONS = {
  DEFECTIVE: "Product is defective or damaged",
  WRONG_ITEM: "Received wrong item",
  SIZE_ISSUE: "Size doesn't fit",
  NOT_AS_DESCRIBED: "Product not as described",
  CHANGED_MIND: "Changed my mind",
  LATE_DELIVERY: "Delivered too late",
  DUPLICATE_ORDER: "Ordered by mistake",
  BETTER_PRICE: "Found better price elsewhere",
} as const;
