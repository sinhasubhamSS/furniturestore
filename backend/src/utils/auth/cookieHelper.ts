import { Response } from "express";
type SameSiteType = "none" | "lax" | "strict";

// Always cross-site friendly: None + Secure
const cookieOptions = {
  httpOnly: true,
  secure: true, // must be HTTPS
  sameSite: "none" as SameSiteType,
} as const;

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    path: "/", // visible to all routes
    maxAge: 15 * 60 * 1000, // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    path: "/api/user/refresh-token", // only for refresh endpoint
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
