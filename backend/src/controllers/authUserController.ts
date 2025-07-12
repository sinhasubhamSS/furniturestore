import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import User from "../models/user.models";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { sendTokenResponse } from "../utils/auth/sendToken";
import { clearAuthCookies } from "../utils/auth/cookieHelper";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";
import { catchAsync } from "../utils/catchAsync";
import jwt from "jsonwebtoken";

export const registerUser = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  const file = req.file;

  if (!name || !email || !password) {
    throw new AppError("All fields are required", 400);
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new AppError("Email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  let avatarUrl = "";
  if (file) {
    const result = await uploadToCloudinary(file.buffer, "avatars");
    avatarUrl = result.secure_url;
  }

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    avatar: avatarUrl,
    role: "buyer",
  });

  sendTokenResponse(res, newUser._id.toString(), "Registration successful", {
    userData: {
      _id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      avatar: newUser.avatar,
    },
  });
});

export const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  sendTokenResponse(res, user._id.toString(), "Login successful", {
    userData: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    },
  });
});

export const logoutUser = catchAsync(async (req: Request, res: Response) => {
  clearAuthCookies(res);
  res.status(200).json(new ApiResponse(200, null, "Logout successful"));
});

export const refreshAccessToken = catchAsync(
  async (req: Request, res: Response) => {
    console.log("reached refreshAccessToken");
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token not found" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!
    ) as { userId: string };
    const user = await User.findById(decoded.userId).select("+refreshToken");

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }
    return sendTokenResponse(res, decoded.userId, "Access token refreshed");
  }
);
