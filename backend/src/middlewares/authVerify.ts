import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.models";

export interface AuthRequest extends Request {
  userId?: string;
  user?: any;
}

export const authVerify = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // Prefer cookie, fallback to Authorization header
  const bearer = req.headers.authorization;
  const headerToken = bearer?.startsWith("Bearer ")
    ? bearer.slice(7)
    : undefined;
  const token = req.cookies?.accessToken || headerToken;

  if (!token) {
    res.status(401).json({ message: "Unauthorized: Token not found" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      userId: string;
    };
    // Load user minimal fields; avoid leaking existence via 404
    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    req.user = user;
    req.userId = user._id.toString();
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
};
