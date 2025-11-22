// controllers/product.controller.ts
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
import { Types } from "mongoose";

// ==================== ADMIN CONTROLLERS ====================

export const createProduct = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw new AppError("Unauthorized", 401);

    // validate input
    const parsedData = createProductSchema.parse(req.body);

    const product = await productService.createProduct(
      { ...parsedData, createdBy: new Types.ObjectId(req.userId) },
      req.userId
    );

    return res
      .status(201)
      .json(new ApiResponse(201, product, "Product created successfully"));
  }
);

export const editProduct = catchAsync(
  async (req: AuthRequest, res: Response) => {
    if (!req.userId) throw new AppError("Unauthorized", 401);

    // Partial update allowed (validated)
    const updateData = updateProductSchema.parse(req.body);

    const updatedProduct = await productService.editProduct(
      req.params.productId,
      req.userId,
      updateData
    );

    return res
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

    return res
      .status(200)
      .json(new ApiResponse(200, deleted, "Product deleted successfully"));
  }
);

// Admin get all products (admin-only)
export const getAllProductsAdmin = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const page = Math.max(1, Number(req.query.page) || 1);
    const rawLimit = Number(req.query.limit) || 10;
    const limit = Math.min(Math.max(1, rawLimit), 200); // admin can ask bigger pages

    const products = await productService.getAllProductsAdmin({}, page, limit);

    return res
      .status(200)
      .json(new ApiResponse(200, products, "All products fetched (Admin)"));
  }
);

// ==================== PUBLIC CONTROLLERS ====================

// GET /products
export const getAllProducts = catchAsync(
  async (req: AuthRequest, res: Response) => {
    // sanitize paging params
    const page = Math.max(1, Number(req.query.page) || 1);
    const rawLimit = Number(req.query.limit) || 10;
    const MAX_LIMIT = 100;
    const limit = Math.min(Math.max(1, rawLimit), MAX_LIMIT);

    // check admin (skip public-only filtering if admin)
    const isAdmin = req.user?.role === "admin";

    // accept sortBy param (price_low, price_high, discount, latest)
    const sortBy = (req.query.sortBy as string) || "latest";

    // simple category filter — accept slug or id (service will handle slug->id)
    const filter: any = {};
    if (req.query.category) {
      filter.category = String(req.query.category);
    }

    // call service
    const products = await productService.getAllProducts(
      filter,
      page,
      limit,
      isAdmin,
      false,
      sortBy
    );

    // Add caching headers for CDN/SSR (public only)
    if (!isAdmin) {
      // short TTL so admin edits appear quickly; s-maxage used by CDNs
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=20, stale-while-revalidate=60"
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, products, "Products fetched successfully"));
  }
);

// GET /products/latest
export const getLatestProducts = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const limit = Math.min(
      Math.max(1, parseInt((req.query.limit as string) || "8")),
      50
    );
    const isAdmin = req.user?.role === "admin";

    const products = await productService.getLatestProducts(limit, isAdmin);

    if (!isAdmin) {
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=20, stale-while-revalidate=60"
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, products, "Latest products fetched"));
  }
);

// GET /products/:slug
export const getProductBySlug = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const isAdmin = req.user?.role === "admin";

    const product = await productService.getProductBySlug(
      req.params.slug,
      isAdmin
    );

    if (!isAdmin) {
      // product pages change less frequently; still short TTL to allow updates
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=10, stale-while-revalidate=30"
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, product, "Product fetched successfully"));
  }
);

// GET /products/id/:productId
export const getProductById = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const isAdmin = req.user?.role === "admin";

    const product = await productService.getProductById(
      req.params.productId,
      isAdmin
    );

    if (!isAdmin) {
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=10, stale-while-revalidate=30"
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, product, "Product fetched successfully"));
  }
);

// GET /products/search?q=...
export const searchProducts = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const keyword = req.query.q?.toString().trim();
    if (!keyword) throw new AppError("Search query is required", 400);

    const page = Math.max(1, Number(req.query.page) || 1);
    const rawLimit = Number(req.query.limit) || 10;
    const limit = Math.min(Math.max(1, rawLimit), 100);
    const isAdmin = req.user?.role === "admin";

    // accept optional sortBy for search too
    const sortBy = (req.query.sortBy as string) || "latest";

    // service: pass sortBy if you extend service to support it for search
    const products = await productService.searchProducts(
      keyword,
      page,
      limit,
      isAdmin /* optionally pass sortBy */
    );

    if (!isAdmin) {
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=10, stale-while-revalidate=30"
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, products, "Search results fetched"));
  }
);

// GET /products/category/:slug
export const getProductsByCategory = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const slug = req.params.slug?.toString().trim();
    if (!slug) throw new AppError("Slug is required", 400);

    const page = Math.max(1, Number(req.query.page) || 1);
    const rawLimit = Number(req.query.limit) || 10;
    const limit = Math.min(Math.max(1, rawLimit), 100);
    const isAdmin = req.user?.role === "admin";
    const sortBy = (req.query.sortBy as string) || "latest";

    const products = await productService.getProductsByCategory(
      slug,
      page,
      limit,
      isAdmin 
    );

    if (!isAdmin) {
      res.setHeader(
        "Cache-Control",
        "public, s-maxage=20, stale-while-revalidate=60"
      );
    }

    return res
      .status(200)
      .json(new ApiResponse(200, products, "Category products fetched"));
  }
);
