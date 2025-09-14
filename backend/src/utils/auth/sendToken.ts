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

  await Session.create({
    user: userId,
    refreshTokenHash,
    userAgent: res.req.headers["user-agent"],
    ip: res.req.ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  setAuthCookies(res, accessToken, refreshToken);

  const response: any = {
    success: true,
    message,
  };

  if (options?.userData) response.user = options.userData;
  if (options?.includeTokensInBody) {
    response.accessToken = accessToken;
    response.refreshToken = refreshToken;
  }

  res.status(200).json(response);
};
