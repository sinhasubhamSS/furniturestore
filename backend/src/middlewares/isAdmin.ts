import { Request, Response, NextFunction } from "express";
import { AuthRequest } from "../types/app-request";
export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    res.status(403).json({
      message: "Access denied .admins only",
    });
    return;
  }
  next();
};
