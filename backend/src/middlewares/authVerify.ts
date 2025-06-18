import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Custom Request interface to add userId (so TypeScript doesn't complain)
interface AuthRequest extends Request {
  userId?: string;
}

export const authVerify = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.cookies.accessToken; // 👈 Reading from cookies

  if (!token) {
    res.status(401).json({ message: "Unauthorized: Token not found" });
    return;
  }

  try {
    // Verifying token
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET!) as {
      userId: string;
    };

    // Adding userId to request object for later use
    req.userId = decoded.userId;

    next(); // Proceed to the next middleware/route
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token" });
    return;
  }
};
