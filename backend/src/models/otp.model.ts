import { Schema, model, models, Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  attempts: number;
}

const otpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    otp: { type: String, required: true, select: false },
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Auto delete expired OTP
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default models.Otp || model<IOtp>("Otp", otpSchema);
