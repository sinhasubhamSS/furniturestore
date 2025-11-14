import { Response } from "express";
import { productService } from "../services/productService";
import { AuthRequest } from "../types/app-request";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";
import { createProductSchema } from "../validations/product.validation";
import { Types } from "mongoose";
import { updateProductSchema } from "../validations/product.validation";

// ==================== ADMIN CONTROLLERS ====================

export const createProduct = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw new AppError("Unauthorized", 401);
    const parsedData = createProductSchema.parse(req.body);

    const product = await productService.createProduct(
      { ...parsedData, createdBy: new Types.ObjectId(req.userId) },
      req.userId
    );

    res
      .status(201)
      .json(new ApiResponse(201, product, "Product created successfully"));
  }
);
export const editProduct = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw new AppError("Unauthorized", 401);

    // Parse and validate input - assuming update schema allows partial fields
    const updateData = updateProductSchema.parse(req.body);

    // Call service method with productId from URL and logged-in user ID
    const updatedProduct = await productService.editProduct(
      req.params.productId,
      req.userId,
      updateData
    );

    res
      .status(200)
      .json(
        new ApiResponse(200, updatedProduct, "Product updated successfully")
      );
  }
);
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

// Admin get all products
export const getAllProductsAdmin = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const products = await productService.getAllProductsAdmin({}, page, limit);

    res
      .status(200)
      .json(new ApiResponse(200, products, "All products fetched (Admin)"));
  }
);

// ==================== PUBLIC CONTROLLERS ====================

export const getAllProducts = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const page = Math.max(1, Number(req.query.page) || 1);

    // clamp limit to avoid heavy responses
    const rawLimit = Number(req.query.limit) || 10;
    const MAX_LIMIT = 100;
    const limit = Math.min(Math.max(1, rawLimit), MAX_LIMIT);

    const isAdmin = req.user?.role === "admin";

    // Extract sort parameter from frontend (default: latest)
    const sortBy = (req.query.sortBy as string) || "latest";

    // Build filter object (simple category filter)
    const filter: any = {};
    if (req.query.category) {
      filter.category = String(req.query.category);
    }

    // Call service (simple version — no fields CSV complexity)
    const products = await productService.getAllProducts(
      filter,
      page,
      limit,
      isAdmin,
      false,
      sortBy
    );

    return res
      .status(200)
      .json(new ApiResponse(200, products, "Products fetched successfully"));
  }
);



export const getProductBySlug = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const isAdmin = req.user?.role === "admin";

    const product = await productService.getProductBySlug(
      req.params.slug,
      isAdmin
    );

    res
      .status(200)
      .json(new ApiResponse(200, product, "Product fetched successfully"));
  }
);

export const getProductById = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const isAdmin = req.user?.role === "admin";

    const product = await productService.getProductById(
      req.params.productId,
      isAdmin
    );

    res
      .status(200)
      .json(new ApiResponse(200, product, "Product fetched successfully"));
  }
);

export const searchProducts = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const keyword = req.query.q?.toString().trim();
    if (!keyword) throw new AppError("Search query is required", 400);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const isAdmin = req.user?.role === "admin";

    const products = await productService.searchProducts(
      keyword,
      page,
      limit,
      isAdmin
    );

    res
      .status(200)
      .json(new ApiResponse(200, products, "Search results fetched"));
  }
);

export const getProductsByCategory = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const slug = req.params.slug?.toString().trim();
    if (!slug) throw new AppError("Slug is required", 400);

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const isAdmin = req.user?.role === "admin";

    const products = await productService.getProductsByCategory(
      slug,
      page,
      limit,
      isAdmin
    );

    res
      .status(200)
      .json(new ApiResponse(200, products, "Category products fetched"));
  }
);

export const getLatestProducts = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 8;
    const isAdmin = req.user?.role === "admin";

    const products = await productService.getLatestProducts(limit, isAdmin);

    res
      .status(200)
      .json(new ApiResponse(200, products, "Latest products fetched"));
  }
);

//
// ✅ ADD: Admin orders with filtering and pagination
