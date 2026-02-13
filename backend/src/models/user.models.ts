import { Schema, model, models, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;

  name: string;
  email: string;
  password: string;

  avatar?: string;
  role: "buyer" | "admin";

  // 🔐 Email Verification
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      select: false,
    },

    avatar: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["buyer", "admin"],
      default: "buyer",
    },

    // ✅ NEW FIELDS FOR VERIFICATION
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    emailVerificationToken: {
      type: String,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = models.User || model<IUser>("User", userSchema);

export default User;
