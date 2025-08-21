import mongoose, { Document, Schema } from "mongoose";

interface INewsletter extends Document {
  email: string;
  isActive: boolean;
  preferences: string[];
  source: string;
  verificationToken?: string;
  isVerified: boolean;
  unsubscribeToken?: string;
  unsubscribedAt?: Date;
  lastEmailSent?: Date;
  emailCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const newsletterSchema = new Schema<INewsletter>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      validate: {
        validator: function (v: string): boolean {
          return /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(v);
        },
        message: "Please enter a valid email address",
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    preferences: [
      {
        type: String,
        enum: [
          "offers",
          "new_products",
          "home_decor_tips",
          "furniture_care",
          "seasonal_collections",
        ],
        default: ["offers", "new_products"],
      },
    ],
    source: {
      type: String,
      default: "website_footer",
      enum: ["website_footer", "checkout", "popup", "manual", "import"],
    },
    verificationToken: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    unsubscribeToken: {
      type: String,
    },
    unsubscribedAt: {
      type: Date,
    },
    lastEmailSent: {
      type: Date,
    },
    emailCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance

newsletterSchema.index({ isActive: 1, isVerified: 1 });
newsletterSchema.index({ verificationToken: 1 });
newsletterSchema.index({ unsubscribeToken: 1 });
newsletterSchema.index({ createdAt: -1 });

// Generate verification token before save
newsletterSchema.pre("save", function (next) {
  if (this.isNew && !this.verificationToken) {
    this.verificationToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }
  if (this.isNew && !this.unsubscribeToken) {
    this.unsubscribeToken =
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);
  }
  next();
});

export const Newsletter = mongoose.model<INewsletter>(
  "Newsletter",
  newsletterSchema
);
