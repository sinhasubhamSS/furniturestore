import { Response } from "express";
import Product from "../models/product.models";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { AuthRequest } from "../types/app-request";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";
import { createProductSchema } from "../validations/product.validation";
import { createProductService } from "../services/productService";
// Create Product
export const createProduct = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const parsedData = createProductSchema.parse(req.body);
    const files = req.files as Express.Multer.File[];
    if (!req.user?._id) {
      throw new AppError("Unauthorized", 401);
    }
    if (!files || files.length === 0) {
      throw new AppError("No files uploaded", 400);
    }
    const product = await createProductService(parsedData, files,  req.user._id.toString());
    res
      .status(201)
      .json(new ApiResponse(201, product, "Product created successfully"));
  }
);

// Update Product
export const updateProduct = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { name, title, description, price, stock, category } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!id) {
      throw new AppError("Product ID is required", 400);
    }

    const product = await Product.findById(id);
    if (!product) {
      throw new AppError("Product not found", 404);
    }

    let imageUrls = product.images;
    if (Array.isArray(files) && files.length > 0) {
      const uploadedResults = await Promise.all(
        files.map((file) => uploadToCloudinary(file.buffer, "products"))
      );
      imageUrls = uploadedResults.map((result) => result.secure_url);
    }

    product.name = name ?? product.name;
    product.title = title ?? product.title;
    product.description = description ?? product.description;
    product.price = price ?? product.price;
    product.stock = stock ?? product.stock;
    product.category = category ?? product.category;
    product.images = imageUrls;

    await product.save();

    res
      .status(200)
      .json(new ApiResponse(200, product, "Product updated successfully"));
  }
);
