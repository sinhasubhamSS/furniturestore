import { Request, Response } from "express";
import { categoryService } from "../services/categoryService";
import { ApiResponse } from "../utils/ApiResponse";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { uploadToCloudinary} from "../utils/cloudinaryUpload"; // Assuming this is your helper

export const createCategory = catchAsync(
  async (req: Request, res: Response) => {
    const { name } = req.body;
    const file = req.file; // from multer

    if (!name) throw new AppError("Name is required", 400);
    if (!file) throw new AppError("Image is required", 400);

    // ✅ Upload to Cloudinary
    const result = await uploadToCloudinary(file.buffer, "categories");
    const imageUrl = result.secure_url;

    const category = await categoryService.createCategory({
      name,
      image: imageUrl,
    });

    res.status(201).json(new ApiResponse(201, category, "Category created"));
  }
);

// ✅ Get All Categories
export const getAllCategories = catchAsync(
  async (_req: Request, res: Response) => {
    const categories = await categoryService.getAllCategories();
    res.status(200).json(new ApiResponse(200, categories, "All categories"));
  }
);
