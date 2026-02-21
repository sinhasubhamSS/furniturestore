import { Schema, model, models, Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
  type: "signup" | "reset";
}

const otpSchema = new Schema<IOtp>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    otp: {
      type: String,
      required: true,
      select: false, // 🔐 never return OTP by default
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    attempts: {
      type: Number,
      default: 0,
    },

    type: {
      type: String,
      enum: ["signup", "reset"],
      required: true,
    },
  },
  { timestamps: true }
);

/* ===========================================
   🔥 INDEXES
=========================================== */

// Auto delete expired OTP
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Fast lookup by email + type
otpSchema.index({ email: 1, type: 1 });

export default models.Otp || model<IOtp>("Otp", otpSchema);