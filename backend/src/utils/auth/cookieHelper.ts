import { Response } from "express";

type SameSiteType = "none" | "lax" | "strict";

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd, // prod: HTTPS required
  sameSite: (isProd ? "none" : "lax") as SameSiteType, // prod: cross-site allowed
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    path: "/", // needed across app
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    path: "/api/user/refresh-token", // only sent to refresh endpoint
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie("accessToken", { ...cookieOptions, path: "/" });
  res.clearCookie("refreshToken", {
    ...cookieOptions,
    path: "/api/user/refresh-token",
  });
};
