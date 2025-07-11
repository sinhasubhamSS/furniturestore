import { Response } from "express";
import { generateAccessToken, generateRefreshToken } from "./generateTokens";
import { setAuthCookies } from "./cookieHelper";
import User from "../../models/user.models";

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
    userData?: UserData; // Make this optional
    includeTokensInBody?: boolean; // For non-cookie clients
  }
) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  await User.findByIdAndUpdate(userId, { refreshToken });

  // Always set HTTP-only cookies
  setAuthCookies(res, accessToken, refreshToken);

  // Prepare base response
  const response: any = {
    success: true,
    message,
  };

  // Conditionally add user data
  if (options?.userData) {
    response.user = {
      _id: options.userData._id,
      name: options.userData.name,
      email: options.userData.email,
      avatar: options.userData.avatar || "",
      role: options.userData.role,
    };
  }

  // Conditionally add tokens in body (for mobile/non-cookie clients)
  if (options?.includeTokensInBody) {
    response.accessToken = accessToken;
    response.refreshToken = refreshToken;
  }

  res.status(200).json(response);
};
