import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.models";
import { AuthRequest } from "../types/app-request";
export const authVerify = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.cookies.accessToken;

  if (!token) {
    res.status(401).json({ message: "Unauthorized: Token not found" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      userId: string;
    };

    const user = await User.findById(decoded.userId).select(
      "-password -refreshToken"
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    req.user = user;
    req.userId = user._id.toString();
    next(); // continue to next middleware
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
