// models/pincode-analytics.model.ts
import { Schema, model, Document } from "mongoose";

export interface PincodeSearchDocument extends Document {
  pincode: string;
  source: "database" | "api" | "api_error";
  responseTime: number;
  isServiceable: boolean;
  searchedAt: Date;
}

const pincodeSearchSchema = new Schema<PincodeSearchDocument>(
  {
    pincode: { type: String, required: true, index: true },
    source: {
      type: String,
      enum: ["database", "api", "api_error"],
      required: true,
    },
    responseTime: { type: Number, required: true },
    isServiceable: { type: Boolean, required: true },
    searchedAt: { type: Date, default: Date.now, index: true },
  },
  { timestamps: true }
);

export const PincodeSearch = model<PincodeSearchDocument>(
  "PincodeSearch",
  pincodeSearchSchema
);
