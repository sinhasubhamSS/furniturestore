import { Schema, model, models, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: "buyer" | "admin";
  isEmailVerified: boolean;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    password: {
      type: String,
      required: true,
      select: false,
    },

    avatar: { type: String, default: "" },

    role: {
      type: String,
      enum: ["buyer", "admin"],
      default: "buyer",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export default models.User || model<IUser>("User", userSchema);
