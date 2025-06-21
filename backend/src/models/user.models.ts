import { Schema, model, models, Document,} from "mongoose";

// 1. Interface (avoid using Document directly with generics, better to extend)
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role: string;
  refreshToken?: string;
  createdAt: Date;
}

// 2. Schema
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
      select: false, // Good practice: password should not be returned by default
    },
    avatar: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["buyer", "admin"], // seller hata de
      default: "buyer",
    },

    refreshToken: {
      type: String,
      select: false, // optional: hide refresh token from queries by default
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// 3. Model
const User = models.User || model<IUser>("User", userSchema);

export default User;
