import { Schema, model, Document, Types } from "mongoose";
import { IDGenerator } from "../utils/IDGenerator";

// ✅ Return status enum - Complete workflow covered
export enum ReturnStatus {
  Requested = "requested",
  Approved = "approved",
  Rejected = "rejected",
  PickedUp = "picked_up",
  Received = "received",
  Processed = "processed",
}

// ✅ Return item interface
export interface ReturnItem {
  orderItemIndex: number;
  quantity: number;
  reason: string;
  condition: "unopened" | "used" | "damaged";
}

// ✅ Main Return document interface
export interface ReturnDocument extends Document {
  returnId: string;
  orderId: string;
  user: Types.ObjectId;
  returnItems: ReturnItem[];
  returnReason: string;
  refundAmount: number;
  status: ReturnStatus;
  requestedAt: Date;
  processedAt?: Date;
  refundProcessedAt?: Date;
  adminNotes?: string;
  adminUpdatedBy?: string;
  adminUpdatedAt?: Date;
}

// ✅ Return item schema
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
    
    // ✅ Admin fields
    adminNotes: {
      type: String,
      maxlength: 2000,
    },
    adminUpdatedBy: {
      type: String,
    },
    adminUpdatedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ✅ Indexes for better performance
returnSchema.index({ user: 1, requestedAt: -1 });
returnSchema.index({ status: 1, requestedAt: -1 });

// ✅ Virtual for order reference
returnSchema.virtual("order", {
  ref: "Order",
  localField: "orderId",
  foreignField: "orderId",
  justOne: true,
});

// ✅ Create model first
const Return = model<ReturnDocument>("Return", returnSchema);

// ✅ PRE-SAVE HOOK after model creation
returnSchema.pre("save", async function (next) {
  if (!this.returnId) {
    this.returnId = await IDGenerator.generateReturnId(Return);
  }
  next();
});

// ✅ Export the model (single declaration)
export { Return };
