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
import { emailService } from "../utils/emailServices";
/**
 * Register
 */

export const registerUser = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, confirmPassword, avatar } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    throw new AppError(
      "Name, email, password & confirm password are required",
      400,
    );
  }

  const normalizedEmail = String(email || "")
    .trim()
    .toLowerCase();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(normalizedEmail)) {
    throw new AppError("Invalid email format", 400);
  }

  if (password.length < 6)
    throw new AppError("Password must be at least 6 characters", 400);

  if (password !== confirmPassword)
    throw new AppError("Passwords do not match", 400);

  const userExists = await User.findOne({ email: normalizedEmail });
  if (userExists) throw new AppError("Email already exists", 409);

  const hashedPassword = await bcrypt.hash(password, 10);

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const tokenExpiry = new Date(Date.now() + 15 * 60 * 1000);

  // 🔥 Create user FIRST
  const newUser = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    avatar: avatar || "",
    role: "buyer",
    emailVerified: false,
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpires: tokenExpiry,
  });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;

  try {
    await emailService.sendEmail({
      from: "Suvidha Wood <no-reply@suvidhawood.com>",
      to: normalizedEmail,
      subject: "Verify Your Email - Suvidha Wood",
      html: `
        <div style="font-family: Arial; max-width:500px; margin:auto;">
          <h2>Welcome to Suvidha Wood</h2>
          <p>Please verify your email by clicking below:</p>
          <div style="text-align:center;margin:20px 0;">
            <a href="${verifyUrl}"
              style="padding:12px 20px;background:#000;color:#fff;text-decoration:none;border-radius:5px;">
              Verify My Email
            </a>
          </div>
          <p>If you did not create this account, ignore this email.</p>
        </div>
      `,
      text: `Verify your email here: ${verifyUrl}`,
    });
  } catch (err: any) {
    // 🔥 IMPORTANT: Delete user if email fails
    await User.findByIdAndDelete(newUser._id);

    throw new AppError(
      "Failed to send verification email. Please try again.",
      500,
    );
  }

  return res.status(201).json({
    success: true,
    message: "Registration successful. Please verify your email.",
  });
});

export const verifyEmail = catchAsync(async (req: Request, res: Response) => {
  const { token } = req.query;

  if (!token) throw new AppError("Verification token missing", 400);

  const hashedToken = crypto
    .createHash("sha256")
    .update(String(token))
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpires: { $gt: new Date() },
  });

  if (!user) throw new AppError("Invalid or expired verification token", 400);

  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpires = undefined;

  await user.save();

  res.status(200).json({
    success: true,
    message: "Email verified successfully. You can now login.",
  });
});
export const resendVerificationEmail = catchAsync(
  async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
      throw new AppError("Email is required", 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) throw new AppError("User not found", 404);

    if (user.emailVerified) throw new AppError("Email already verified", 400);

    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.emailVerificationToken = hashedToken;
    user.emailVerificationTokenExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${rawToken}`;

    await emailService.sendEmail({
      from: "Suvidha Wood <no-reply@suvidhawood.com>",
      to: user.email,
      subject: "Suvidha Wood Email Verification",
      html: `<a href="${verifyUrl}">Verify Email</a>`,
    });

    res.status(200).json({
      success: true,
      message: "Verification email resent",
    });
  },
);

/**
 * Login
 */
export const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  // Normalize email (same as register)
  const normalizedEmail = String(email).trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );

  if (!user) {
    console.warn("-> login failed: user not found", {
      email: normalizedEmail,
      ip: req.ip,
    });
    throw new AppError("Invalid credentials", 401);
  }

  // 🔐 Compare password
  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    console.warn("-> login failed: invalid password", {
      email: normalizedEmail,
      ip: req.ip,
    });
    throw new AppError("Invalid credentials", 401);
  }

  // 🔥 Email verification check (VERY IMPORTANT)
  if (!user.emailVerified) {
    throw new AppError("Please verify your email before logging in", 401);
  }

  console.log("-> login success, creating session for user:", {
    userId: user._id.toString(),
    ip: req.ip,
  });

  // Generate tokens + create session
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

/**
 * Logout (revoke current session + clear cookies)
 */
export const logoutUser = catchAsync(async (req: Request, res: Response) => {
  try {
    const rt = req.cookies?.refreshToken;
    if (rt) {
      const hash = crypto.createHash("sha256").update(rt).digest("hex");
      // revoke only the matching session
      const result = await Session.updateOne(
        { refreshTokenHash: hash, revokedAt: null },
        { $set: { revokedAt: new Date() } },
      );
      // mongoose update result shape varies by version; show what we can
      const modifiedCount =
        (result as any).modifiedCount ?? (result as any).nModified ?? result;
      console.log("✅ logout: session revoke result:", modifiedCount);
    } else {
      console.log("-> logout: no refresh cookie present");
    }

    clearAuthCookies(res);
    return res
      .status(200)
      .json(new ApiResponse(200, null, "Logout successful"));
  } catch (err: any) {
    console.error("-> logout error:", err?.message || err);
    // always clear cookies client-side even if DB revoke fails
    clearAuthCookies(res);
    return res.status(500).json(new ApiResponse(500, null, "Logout failed"));
  }
});

/**
 * Refresh (rotation + reuse detection)
 * Replaced with safer rotation flow + logging
 */
export const refreshAccessToken = catchAsync(
  async (req: Request, res: Response) => {
    // quick debug log
    console.log("-> refreshAttempt", {
      hasCookie: !!req.cookies?.refreshToken,
      ip: req.ip,
      ua: req.headers["user-agent"],
      uptime: process.uptime(),
    });

    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      console.warn("-> refresh: no refresh cookie");
      clearAuthCookies(res);
      return res.status(401).json({ message: "Refresh token not found" });
    }

    let decoded: { userId: string } | null = null;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string,
      ) as { userId: string };
    } catch (err: any) {
      console.warn("-> refresh: jwt verify failed:", err?.message || err);
      clearAuthCookies(res);
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const receivedHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    // prepare new tokens (we will rotate only if DB update succeeds)
    const newAccess = generateAccessToken(decoded.userId);
    const newRefresh = generateRefreshToken(decoded.userId);
    const newHash = crypto
      .createHash("sha256")
      .update(newRefresh)
      .digest("hex");
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Attempt atomic rotation
    let updated;
    try {
      updated = await Session.findOneAndUpdate(
        {
          refreshTokenHash: receivedHash,
          revokedAt: null,
          expiresAt: { $gt: new Date() },
        },
        {
          $set: {
            // rotate: replace with newHash + update metadata
            refreshTokenHash: newHash,
            lastUsedAt: new Date(),
            expiresAt: newExpiresAt,
            userAgent: req.headers["user-agent"],
            ip: req.ip,
          },
        },
        { new: true },
      );
    } catch (err: any) {
      console.error(
        "-> refresh: DB error during rotation:",
        err?.message || err,
      );
      clearAuthCookies(res);
      return res.status(500).json({ message: "Server error" });
    }

    if (!updated) {
      // Rotation failed: decide whether to revoke all or just this session.
      try {
        const maybeSession = await Session.findOne({
          refreshTokenHash: receivedHash,
        });

        if (maybeSession) {
          // session exists => strong signal of reuse or double-use; revoke all (security)
          console.warn(
            "-> refresh: token reuse suspected — revoking all sessions for user:",
            decoded.userId,
          );
          await Session.updateMany(
            { user: decoded.userId },
            { $set: { revokedAt: new Date() } },
          );
        } else {
          // session not found => could be race/expired or DB timing issue.
          // Safer to NOT revoke other sessions. Just clear cookies and return 401.
          console.warn(
            "-> refresh: rotation failed but session not found (race/expired). Not revoking other sessions.",
          );
        }
      } catch (uErr: any) {
        console.error(
          "-> refresh: error during reuse handling:",
          uErr?.message || uErr,
        );
        // As a fallback, do not revoke all here to avoid accidental logouts,
        // but you may choose otherwise if you prefer strict behavior.
      }

      clearAuthCookies(res);
      return res
        .status(401)
        .json({ message: "Invalid or reused refresh token" });
    }

    // success -> set new cookies and return
    setAuthCookies(res, newAccess, newRefresh);

    console.log("✅ refresh: rotated session", {
      userId: decoded.userId,
      sessionId: updated._id?.toString(),
      hashPreview: newHash.slice(0, 8),
    });

    return res
      .status(200)
      .json({ success: true, message: "Access token refreshed" });
  },
);

/**
 * Profile
 */
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
  },
);
