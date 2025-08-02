import { Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse"; // Assuming you have a unified response class
import { catchAsync } from "../utils/catchAsync"; // Wrapper for async error handling
import { adminService } from "../services/adminService";

export class AdminController {
  static getDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const stats = await adminService.getDashboardStats();

    res.status(200).json(
      new ApiResponse(200, stats, "Admin dashboard stats fetched successfully")
    );
  });
}
