import { Response } from "express";
import { generateAccessToken, generateRefreshToken } from "./generateTokens";
import { setAuthCookies } from "./cookieHelper";
import crypto from "crypto";
import { Session } from "../../models/session.model";

interface UserData {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

export const sendTokenResponse = async (
  res: Response,
  userId: string,
  message: string,
  options?: {
    userData?: UserData;
    includeTokensInBody?: boolean;
  }
) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  try {
    await Session.create({
      user: userId,
      refreshTokenHash,
      userAgent: res.req.headers["user-agent"],
      ip: res.req.ip,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });
  } catch (err: any) {
    console.error("❌ Failed to create session:", err.message || err);

    // Optional retry (very rare hash collision case)
    // You can safely ignore or log only, as it doesn’t break auth flow
  }

  // Set httpOnly cookies
  setAuthCookies(res, accessToken, refreshToken);

  // Build JSON response
  const response: any = {
    success: true,
    message,
  };

  if (options?.userData) response.user = options.userData;

  // Optional: include tokens in body only for dev/debug
  if (options?.includeTokensInBody && process.env.NODE_ENV !== "production") {
    response.accessToken = accessToken;
    response.refreshToken = refreshToken;
  }

  res.status(200).json(response);
};
