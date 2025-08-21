import mongoose, { Document, Schema } from "mongoose";

interface IInteractiveFAQ extends Document {
  // Basic FAQ info
  question: string;
  shortAnswer: string; // For quick display
  detailedAnswer?: string; // For full explanation

  // Categorization
  category: "products" | "orders" | "payment" | "general";
  subCategory?: string; // 'sofa', 'delivery', 'emi' etc.

  // Interactive flow
  parentQuestionId?: mongoose.Types.ObjectId; // For follow-up questions
  followUpQuestions?: mongoose.Types.ObjectId[]; // Child questions

  // Metadata
  displayOrder: number;
  isActive: boolean;
  tags: string[];

  // Analytics
  viewCount: number;
  helpfulCount: number;
  notHelpfulCount: number;

  // Actions
  actionType?: "TRACK_ORDER" | "CONTACT_SUPPORT" | "WHATSAPP" | "LINK" | "NONE";
  actionData?: string; // URL, phone number, etc.

  createdAt: Date;
  updatedAt: Date;
}

const interactiveFAQSchema = new Schema<IInteractiveFAQ>(
  {
    question: { type: String, required: true, trim: true },
    shortAnswer: { type: String, required: true, maxlength: 200 },
    detailedAnswer: { type: String, maxlength: 1000 },

    category: {
      type: String,
      enum: ["products", "orders", "payment", "general"],
      required: true,
    },
    subCategory: { type: String, trim: true },

    parentQuestionId: { type: Schema.Types.ObjectId, ref: "InteractiveFAQ" },
    followUpQuestions: [{ type: Schema.Types.ObjectId, ref: "InteractiveFAQ" }],

    displayOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String, trim: true, lowercase: true }],

    viewCount: { type: Number, default: 0 },
    helpfulCount: { type: Number, default: 0 },
    notHelpfulCount: { type: Number, default: 0 },

    actionType: {
      type: String,
      enum: ["TRACK_ORDER", "CONTACT_SUPPORT", "WHATSAPP", "LINK", "NONE"],
      default: "NONE",
    },
    actionData: { type: String },
  },
  {
    timestamps: true,
  }
);

// Indexes
interactiveFAQSchema.index({ category: 1, isActive: 1, displayOrder: 1 });
interactiveFAQSchema.index({ parentQuestionId: 1 });
interactiveFAQSchema.index({ tags: 1 });

export const InteractiveFAQ = mongoose.model<IInteractiveFAQ>(
  "InteractiveFAQ",
  interactiveFAQSchema
);
