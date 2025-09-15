import { Response } from "express";
type SameSiteType = "none" | "lax" | "strict";

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production"
      ? ("none" as SameSiteType)
      : ("lax" as SameSiteType),
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
  maxAge: 15 * 60 * 1000 // 15 minutes
 // 15 minutes
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    path: "/api/user/refresh-token",

    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const clearAuthCookies = (res: Response): void => {
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("refreshToken", {
    ...cookieOptions,
    path: "/api/user/refresh-token",
  });
};
