import { Request, Response } from "express";
import { categoryService } from "../services/categoryService";
import { ApiResponse } from "../utils/ApiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

export const createCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { name, image } = req.body;

    if (!name) throw new AppError("Name is required", 400);
    if (!image?.url || !image?.public_id) {
      throw new AppError("Image data (url and public_id) is required", 400);
    }

    const category = await categoryService.createCategory({
      name,
      image,
    });

    res.status(201).json(new ApiResponse(201, category, "Category created"));
  },
);

// ✅ Get All Categories
export const getAllCategories = catchAsync(
  async (_req: Request, res: Response) => {
    const categories = await categoryService.getAllCategories();
    res.status(200).json(new ApiResponse(200, categories, "All categories"));
  },
);
// ✅ Get Category Slugs (SEO / Sitemap)
export const getCategorySlugs = catchAsync(
  async (_req: Request, res: Response) => {
    const slugs = await categoryService.getCategorySlugs();

    res.status(200).json(new ApiResponse(200, slugs, "Category slugs"));
  },
);
