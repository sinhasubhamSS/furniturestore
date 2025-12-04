import { Response } from "express";

/**
 * Better paths:
 * - accessToken available everywhere → "/"
 * - refreshToken SHOULD also be accessible to refresh route → "/" (not restricted path)
 */
const COOKIE_ACCESS_PATH = "/";
const COOKIE_REFRESH_PATH = "/";

const ACCESS_TTL_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

const isProd = process.env.NODE_ENV === "production";

/**
 * FINAL COOKIE LOGIC:
 *
 * 🔥 DEV (localhost):
 *   secure: false
 *   sameSite: "lax"
 *   → Browser WILL store cookies even on cross-origin localhost
 *
 * 🔥 PROD (https domains):
 *   secure: true
 *   sameSite: "none"
 *   → Required for cross-site cookies
 */
const cookieOptions = {
  httpOnly: true,
  secure: isProd ? true : false,
  sameSite: isProd ? "none" : "lax", // dev-friendly, prod-secure
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

  console.log("→ Cookies set:", {
    env: process.env.NODE_ENV,
    access: COOKIE_ACCESS_PATH,
    refresh: COOKIE_REFRESH_PATH,
    sameSite: cookieOptions.sameSite,
    secure: cookieOptions.secure,
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

export {
  ACCESS_TTL_MS as ACCESS_TTL,
  REFRESH_TTL_MS as REFRESH_TTL,
  COOKIE_REFRESH_PATH,
};
