import { Response } from "express";
type SameSiteType = "none" | "lax" | "strict";

/**
 * NOTE:
 * Using NODE_ENV to decide secure flag so local dev (http) can still set cookies.
 * Refresh cookie path unified to "/api/user/refresh-token" to match your clearAuthCookies.
 * If your actual refresh endpoint path is different, make them identical.
 */

const COOKIE_REFRESH_PATH = "/api/user/refresh-token";
const COOKIE_ACCESS_PATH = "/";

const ACCESS_TTL_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const isProd = process.env.NODE_ENV === "production";
const cookieOptions = {
  httpOnly: true, // JS से read न हो, safe
  secure: isProd, // prod => true, localhost => false
  sameSite: isProd ? "none" : "lax", // prod cross-site needs none, dev use lax
} as const;
export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    path: COOKIE_ACCESS_PATH,
    maxAge: ACCESS_TTL_MS,
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    path: COOKIE_REFRESH_PATH,
    maxAge: REFRESH_TTL_MS,
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie("accessToken", {
    ...cookieOptions,
    path: COOKIE_ACCESS_PATH,
  });
  res.clearCookie("refreshToken", {
    ...cookieOptions,
    path: COOKIE_REFRESH_PATH,
  });
};

// export constants in case other files need them
export {
  ACCESS_TTL_MS as ACCESS_TTL,
  REFRESH_TTL_MS as REFRESH_TTL,
  COOKIE_REFRESH_PATH,
};
