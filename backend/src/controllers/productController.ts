import { Response } from "express";
import { productService } from "../services/productService";
import { AuthRequest } from "../types/app-request";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";
import slugify from "slugify";
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

    let { basePrice, gstRate, name, isPublished = false, ...rest } = parsedData;

    gstRate = gstRate > 1 ? gstRate / 100 : gstRate;
    const finalPrice = basePrice + basePrice * gstRate;

    const slug = slugify(name, { lower: true, strict: true });

    const productInput = {
      name,
      slug,
      basePrice,
      gstRate,
      price: finalPrice,
      isPublished,
      ...rest,
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

    let updatedData = { ...parsedData };

    // ✅ If name is updated, regenerate slug
    if (parsedData.name) {
      updatedData.slug = slugify(parsedData.name, {
        lower: true,
        strict: true,
      });
    }

    const updated = await productService.updateProduct(
      updatedData,
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

// ✅ Get Single Product by ID
export const getProductById = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const product = await productService.getProductById(req.params.productId);

    res
      .status(200)
      .json(new ApiResponse(200, product, "Product fetched successfully"));
  }
);

// ✅ Get All Products
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

// ✅ Search Products
export const searchProducts = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const keyword = req.query.q?.toString().trim();
    if (!keyword) throw new AppError("Search query is required", 400);

    const products = await productService.searchProducts(keyword);
    res
      .status(200)
      .json(
        new ApiResponse(200, products, "Search results fetched successfully")
      );
  }
);

// ✅ Get Products by Category (by category slug)
export const getProductsByCategory = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const slug = req.params.slug?.toString().trim();
    if (!slug) throw new AppError("Slug is required", 400);

    const products = await productService.getProductsByCategory(slug);
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          products,
          "Products by category fetched successfully"
        )
      );
  }
);

// ✅ Latest Products
export const getLatestProducts = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 8;
    const products = await productService.getLatestProducts(limit);
    res
      .status(200)
      .json(new ApiResponse(200, products, "Latest products fetched"));
  }
);
