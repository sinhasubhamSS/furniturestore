import mongoose, { Document, Schema } from "mongoose";

interface ISupportTicket extends Document {
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string; // Made optional
  subject: string;
  description: string; // Changed from message to description
  category: "product_inquiry" | "order_issue" | "delivery" | "return_refund" | "technical" | "general";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  productId?: mongoose.Types.ObjectId;
  orderId?: string;
  assignedTo?: string;
  userId?: mongoose.Types.ObjectId; // Added userId
  replies?: Array<{
    message: string;
    isAdmin: boolean;
    timestamp: Date;
  }>; // Added replies array
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const supportTicketSchema = new Schema<ISupportTicket>(
  {
    ticketNumber: {
      type: String,
      unique: true,
      required: true,
      default: function (): string {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const time = Date.now().toString().slice(-6);
        return `TKT-${year}${month}${day}-${time}`;
      },
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    customerPhone: {
      type: String,
      trim: true,
      required: false, // Made optional
    },
    subject: {
      type: String,
      required: true, // Made required
      maxlength: 500,
    },
    description: { // Changed from message
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        "product_inquiry",
        "order_issue", 
        "delivery",
        "return_refund",
        "technical",
        "general",
      ],
      required: true,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: ["open", "in_progress", "resolved", "closed"],
      default: "open",
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    orderId: {
      type: String,
    },
    assignedTo: {
      type: String,
    },
    userId: { // Added userId
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    replies: [{ // Added replies array
      message: { type: String, required: true },
      isAdmin: { type: Boolean, default: false },
      timestamp: { type: Date, default: Date.now }
    }],
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Better indexes
supportTicketSchema.index({ customerEmail: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ category: 1 });

supportTicketSchema.index({ userId: 1 });

export const SupportTicket = mongoose.model<ISupportTicket>(
  "SupportTicket",
  supportTicketSchema
);
