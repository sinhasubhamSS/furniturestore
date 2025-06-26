import { Response } from "express";
import { productService } from "../services/productService";
import { AuthRequest } from "../types/app-request";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";
import {
  createProductSchema,
  updateProductSchema,
} from "../validations/product.validation";

// ✅ Create Product
export const createProduct = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const parsedData = createProductSchema.parse(req.body);
    const files = req.files as Express.Multer.File[];

    if (!req.userId) throw new AppError("Unauthorized", 401);
    if (!files || files.length === 0)
      throw new AppError("No files uploaded", 400);

    let { basePrice, gstRate, ...rest } = parsedData;

    // ✅ Convert GST to decimal if it's greater than 1 (e.g., 18 -> 0.18)
    gstRate = gstRate > 1 ? gstRate / 100 : gstRate;

    const finalPrice = basePrice + basePrice * gstRate;

    const productInput = {
      ...rest,
      basePrice,
      gstRate, // ✅ Store as decimal
      price: finalPrice, // ✅ price includes GST (no shipping)
    };

    const product = await productService.createProduct(
      productInput,
      files,
      req.userId
    );

    res
      .status(201)
      .json(new ApiResponse(201, product, "Product created successfully"));
  }
);

// ✅ Update Product
export const updateProduct = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const parsedData = updateProductSchema.parse(req.body);
    const files = req.files as Express.Multer.File[];

    if (!req.userId) throw new AppError("Unauthorized", 401);

    const updated = await productService.updateProduct(
      parsedData,
      files,
      req.params.productId,
      req.userId
    );

    res
      .status(200)
      .json(new ApiResponse(200, updated, "Product updated successfully"));
  }
);

// ✅ Delete Product
export const deleteProduct = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw new AppError("Unauthorized", 401);

    const deleted = await productService.deleteProduct(
      req.params.productId,
      req.userId
    );

    res
      .status(200)
      .json(new ApiResponse(200, deleted, "Product deleted successfully"));
  }
);

// ✅ Get Single Product (No auth required here)
export const getProductById = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const product = await productService.getProductById(req.params.productId);

    res
      .status(200)
      .json(new ApiResponse(200, product, "Product fetched successfully"));
  }
);

// ✅ Get All Products (public)
export const getAllProducts = catchAsync(
  async (_req: AuthRequest, res: Response) => {
    const products = await productService.getAllProducts();
    res
      .status(200)
      .json(
        new ApiResponse(200, products, "All products fetched successfully")
      );
  }
);
export const searchProducts = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const keyword = req.query.q?.toString().trim();
    if (!keyword) throw new AppError("search query is  requuired", 400);
    const products = await productService.searchProducts(keyword);
    res
      .status(200)
      .json(
        new ApiResponse(200, products, "Search results fetched successfully")
      );
  }
);
export const getProductsByCategory = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const category = req.query.category?.toString().trim();
    if (!category) throw new AppError("category is required", 400);
    const products = await productService.getProductsByCategory(category);
    res
      .status(200)
      .json(
        new ApiResponse(200, products, "Search results fetched successfully")
      );
  }
);
