// controllers/auth.controller.ts
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.models";
import { Session } from "../models/session.model";
import { sendTokenResponse } from "../utils/auth/sendToken";
import { setAuthCookies, clearAuthCookies } from "../utils/auth/cookieHelper";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AuthRequest } from "../types/app-request";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/auth/generateTokens";

// Register
export const registerUser = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, avatar } = req.body;
  if (!name || !email || !password)
    throw new AppError("All fields are required", 400);

  const userExists = await User.findOne({ email });
  if (userExists) throw new AppError("Email already exists", 409);

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
    avatar: avatar || "",
    role: "buyer",
  });

  await sendTokenResponse(
    res,
    newUser._id.toString(),
    "Registration successful",
    {
      userData: {
        _id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        avatar: newUser.avatar,
      },
    }
  );
});

// Login
export const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new AppError("Invalid credentials", 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError("Invalid credentials", 401);

  await sendTokenResponse(res, user._id.toString(), "Login successful", {
    userData: {
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    },
  });
});

// Logout (revoke current session + clear cookies)
export const logoutUser = catchAsync(async (req: Request, res: Response) => {
  const rt = req.cookies?.refreshToken;
  if (rt) {
    const hash = crypto.createHash("sha256").update(rt).digest("hex");
    await Session.updateOne(
      { refreshTokenHash: hash },
      { $set: { revokedAt: new Date() } }
    );
  }
  clearAuthCookies(res);
  res.status(200).json(new ApiResponse(200, null, "Logout successful"));
});

// Refresh (rotation + reuse detection)
export const refreshAccessToken = catchAsync(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Refresh token not found" });
    }

    let decoded: { userId: string } | null = null;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
      ) as { userId: string };
    } catch {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const receivedHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await Session.findOne({ refreshTokenHash: receivedHash });
    if (
      !session ||
      session.revokedAt ||
      (session.expiresAt && session.expiresAt < new Date())
    ) {
      await Session.updateMany(
        { user: decoded.userId },
        { $set: { revokedAt: new Date() } }
      );
      clearAuthCookies(res);
      return res
        .status(401)
        .json({ message: "Invalid or reused refresh token" });
    }

    const newAccess = generateAccessToken(decoded.userId);
    const newRefresh = generateRefreshToken(decoded.userId);
    const newHash = crypto
      .createHash("sha256")
      .update(newRefresh)
      .digest("hex");

    session.refreshTokenHash = newHash;
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    session.lastUsedAt = new Date();
    session.userAgent = req.headers["user-agent"];
    session.ip = req.ip;
    await session.save();

    setAuthCookies(res, newAccess, newRefresh);
    return res
      .status(200)
      .json({ success: true, message: "Access token refreshed" });
  }
);

// Profile
export const getMyProfile = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const userId = req.userId;
    if (!userId)
      throw new AppError("Unauthorized: User not authenticated", 401);

    const user = await User.findById(userId).select("-password");
    if (!user) throw new AppError("User not found", 404);

    res
      .status(200)
      .json(new ApiResponse(200, user, "User profile fetched successfully"));
  }
);
