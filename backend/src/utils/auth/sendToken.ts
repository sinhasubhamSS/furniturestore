import { Response } from "express";
import { generateAccessToken, generateRefreshToken } from "./generateTokens";
import { setAuthCookies } from "./cookieHelper";
import crypto from "crypto";
import { Session } from "../../models/session.model";
import { Types } from "mongoose";

interface UserData {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
}

const hash = (token: string) =>
  crypto.createHash("sha256").update(token).digest("hex");

/**
 * Minimal retry: try creating session up to 2 times before failing.
 * If Session.create fails -> do NOT set cookies and return 500.
 */

async function createSessionWithRetry(payload: {
  userId: string;
  refreshTokenHash: string;
  userAgent?: string;
  ip?: string;
  expiresAt: Date;
}) {
  let lastErr: any = null;
  for (let i = 0; i < 2; i++) {
    try {
      const doc = await Session.create({
        user: new Types.ObjectId(payload.userId),
        refreshTokenHash: payload.refreshTokenHash,
        userAgent: payload.userAgent || "",
        ip: payload.ip,
        expiresAt: payload.expiresAt,
      });
      return doc;
    } catch (err: any) {
      lastErr = err;
      // small delay before retry
      if (i === 0) await new Promise((r) => setTimeout(r, 200));
    }
  }
  throw lastErr;
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

  const refreshTokenHash = hash(refreshToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  try {
    const sessionDoc = await createSessionWithRetry({
      userId,
      refreshTokenHash,
      userAgent: res.req.headers["user-agent"] as string,
      ip: res.req.ip,
      expiresAt,
    });

    console.log("✅ Session created:", {
      id: sessionDoc._id?.toString(),
      hashPreview: refreshTokenHash.slice(0, 8),
    });
  } catch (err: any) {
    console.error(
      "❌ Failed to create session after retries:",
      err?.message || err
    );
    // IMPORTANT: do NOT set cookies if DB persistence failed.
    return res
      .status(500)
      .json({
        success: false,
        message: "Failed to create session. Try again.",
      });
  }

  // Set httpOnly cookies (DB session exists)
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

  return res.status(200).json(response);
};
