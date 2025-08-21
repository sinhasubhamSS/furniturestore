import mongoose, { Document, Schema } from "mongoose";

interface ISupportTicket extends Document {
  ticketNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  subject: string;
  message: string;
  category:
    | "product_inquiry"
    | "order_issue"
    | "delivery"
    | "return_refund"
    | "technical"
    | "general";
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  productId?: mongoose.Types.ObjectId;
  orderId?: string;
  assignedTo?: string;
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
        return "ST" + Date.now().toString().slice(-6);
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
      required: true,
    },
    subject: {
      type: String,
      required: true,
      maxlength: 500,
    },
    message: {
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
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes

supportTicketSchema.index({ customerEmail: 1 });
supportTicketSchema.index({ status: 1 });
supportTicketSchema.index({ category: 1 });

export const SupportTicket = mongoose.model<ISupportTicket>(
  "SupportTicket",
  supportTicketSchema
);
