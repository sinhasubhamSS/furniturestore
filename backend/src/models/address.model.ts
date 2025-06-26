import { Schema, model, models, Document, Types } from "mongoose";

export interface IAddress extends Document {
  user: Types.ObjectId;
  fullName: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  landmark?: string;
  state: string;
  pincode: string;
  country: string;
  isDefault: boolean;
  createdAt: Date;
}

const addressSchema = new Schema<IAddress>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine1: {
      type: String,
      required: true,
      trim: true,
    },
    addressLine2: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    state: {
      type: String,
      required: true,
      trim: true,
    },
    pincode: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      required: true,
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },

  { timestamps: true }
);

// Ensure only one default address per user
addressSchema.index(
  { user: 1, isDefault: 1 },
  { unique: true, partialFilterExpression: { isDefault: true } }
);

const Address = models.Address || model<IAddress>("Address", addressSchema);
export default Address;
