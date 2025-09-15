import { Response } from "express";
type SameSiteType = "none" | "lax" | "strict";

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true,
  secure: isProd, // ✅ prod = true
  sameSite: isProd ? ("none" as SameSiteType) : ("lax" as SameSiteType),
  domain: isProd ? ".onrender.com" : undefined,
  // ^ optional: agar same root domain hota to best hota,
  // abhi tum Vercel+Render alag-alag use kar rahe ho so isko skip bhi kar sakte ho
};

export const setAuthCookies = (
  res: Response,
  accessToken: string,
  refreshToken: string
): void => {
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: 15 * 60 * 1000, // 15 minutes
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
