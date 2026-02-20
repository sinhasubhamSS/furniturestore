import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/user.models";
import Otp from "../models/otp.model";
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

/* =========================================================
   1️⃣ SEND OTP FOR SIGNUP
========================================================= */

export const sendSignupOtp = catchAsync(async (req: Request, res: Response) => {
  const { name, email, password, confirmPassword } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    throw new AppError("All fields are required", 400);
  }

  const normalizedEmail = String(email).trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new AppError("Invalid email format", 400);
  }

  if (password.length < 6)
    throw new AppError("Password must be at least 6 characters", 400);

  if (password !== confirmPassword)
    throw new AppError("Passwords do not match", 400);

  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) throw new AppError("Email already exists", 409);
  const existingOtp = await Otp.findOne({ email: normalizedEmail });

  if (existingOtp && existingOtp.expiresAt > new Date()) {
    throw new AppError(
      "OTP already sent. Please wait 5 minutes before requesting again.",
      429,
    );
  }
  const rawOtp = Math.floor(100000 + Math.random() * 900000).toString();
  const hashedOtp = crypto.createHash("sha256").update(rawOtp).digest("hex");

  await Otp.deleteMany({ email: normalizedEmail });

  await Otp.create({
    email: normalizedEmail,
    otp: hashedOtp,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });

  await emailService.sendEmail({
    from: "Suvidha Wood <no-reply@suvidhawood.com>",
    to: normalizedEmail,
    subject: "Your OTP for Signup",
    html: `
      <div style="text-align:center;font-family:Arial">
        <h2>Your Signup OTP</h2>
        <h1 style="letter-spacing:5px">${rawOtp}</h1>
        <p>Valid for 5 minutes</p>
      </div>
    `,
    text: `Your OTP is ${rawOtp}. Valid for 5 minutes.`,
  });

  return res.status(200).json({
    success: true,
    message: "OTP sent successfully",
  });
});

/* =========================================================
   2️⃣ VERIFY OTP & CREATE USER
========================================================= */

export const verifySignupOtp = catchAsync(
  async (req: Request, res: Response) => {
    const { name, email, password, otp } = req.body;

    if (!name || !email || !password || !otp) {
      throw new AppError("All fields are required", 400);
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const otpDoc = await Otp.findOne({ email: normalizedEmail }).select("+otp");

    if (!otpDoc) throw new AppError("OTP expired or not found", 400);

    if (otpDoc.expiresAt < new Date()) {
      await Otp.deleteMany({ email: normalizedEmail });
      throw new AppError("OTP expired", 400);
    }

    if (otpDoc.attempts >= 5) {
      await Otp.deleteMany({ email: normalizedEmail });
      throw new AppError("Too many attempts. Please request new OTP.", 429);
    }

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOtp !== otpDoc.otp) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      throw new AppError("Invalid OTP", 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new AppError("User already exists", 409);
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      role: "buyer",
      isEmailVerified: true,
    });

    await Otp.deleteMany({ email: normalizedEmail });

    /* =============================
       🔐 AUTO LOGIN PART
    ============================= */

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");
    // 🔐 Limit max 3 active sessions
    const activeSessions = await Session.find({
      user: user._id,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    }).sort({ createdAt: 1 });

    if (activeSessions.length >= 3) {
      // remove oldest session
      await Session.deleteOne({ _id: activeSessions[0]._id });
    }

    await Session.create({
      user: user._id,
      refreshTokenHash,
      userAgent: req.headers["user-agent"],
      ip: req.headers["x-forwarded-for"] || req.ip,

      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    setAuthCookies(res, accessToken, refreshToken);

    return res.status(201).json({
      success: true,
      message: "Signup successful",
      userData: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  },
);

/* =========================================================
   LOGIN + SESSION CREATION
========================================================= */

export const loginUser = catchAsync(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password)
    throw new AppError("Email and password are required", 400);

  const normalizedEmail = String(email).trim().toLowerCase();

  const user = await User.findOne({ email: normalizedEmail }).select(
    "+password",
  );

  if (!user) throw new AppError("Invalid credentials", 401);

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new AppError("Invalid credentials", 401);

  if (!user.isEmailVerified) throw new AppError("Email not verified", 401);

  const accessToken = generateAccessToken(user._id.toString());
  const refreshToken = generateRefreshToken(user._id.toString());

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  // 🔐 Limit max 3 active sessions
  const activeSessions = await Session.find({
    user: user._id,
    revokedAt: null,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: 1 });

  if (activeSessions.length >= 3) {
    // remove oldest session
    await Session.deleteOne({ _id: activeSessions[0]._id });
  }

  await Session.create({
    user: user._id,
    refreshTokenHash,
    userAgent: req.headers["user-agent"],
    ip: req.headers["x-forwarded-for"] || req.ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  setAuthCookies(res, accessToken, refreshToken);

  return res.status(200).json({
    success: true,
    message: "Login successful",
    userData: {
      _id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    },
  });
});

/* =========================================================
   LOGOUT
========================================================= */

export const logoutUser = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    const hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    await Session.updateOne(
      { refreshTokenHash: hash, revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
  }

  clearAuthCookies(res);

  return res.status(200).json(new ApiResponse(200, null, "Logout successful"));
});

/* =========================================================
   REFRESH TOKEN ROTATION
========================================================= */

export const refreshAccessToken = catchAsync(
  async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ message: "Refresh token not found" });

    let decoded: any;

    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string,
      );
    } catch {
      clearAuthCookies(res);
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const receivedHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await Session.findOne({
      refreshTokenHash: receivedHash,
      revokedAt: null,
      expiresAt: { $gt: new Date() },
    });

    if (!session) {
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
    session.lastUsedAt = new Date();
    await session.save();

    setAuthCookies(res, newAccess, newRefresh);

    return res.status(200).json({
      success: true,
      message: "Access token refreshed",
    });
  },
);

/* =========================================================
   PROFILE
========================================================= */

export const getMyProfile = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId)
      throw new AppError("Unauthorized: User not authenticated", 401);

    const user = await User.findById(req.userId).select("-password");
    if (!user) throw new AppError("User not found", 404);

    res
      .status(200)
      .json(new ApiResponse(200, user, "User profile fetched successfully"));
  },
);
