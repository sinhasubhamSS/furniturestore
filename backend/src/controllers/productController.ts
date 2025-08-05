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
    console.log("reached here");
    const parsedData = createProductSchema.parse(req.body);
    console.log("Parsed Data:", parsedData);

    if (!req.userId) throw new AppError("Unauthorized", 401);
    if (!parsedData.images || parsedData.images.length === 0)
      throw new AppError("No images provided", 400);

    const {
      basePrice,
      gstRate, // e.g., 18 for 18%
      name,
      images,
      isPublished = false,
      ...rest
    } = parsedData;

    // ✅ Convert GST rate from percent to decimal (e.g., 18 -> 0.18)
    const finalGstRate = gstRate / 100;

    // ✅ Calculate final price = basePrice + (basePrice * gst)
    const finalPrice = basePrice + basePrice * finalGstRate;

    // ✅ Generate slug from name
    const slug = slugify(name, { lower: true, strict: true });

    // ✅ Construct product input for DB
    const productInput = {
      name,
      slug,
      basePrice,
      gstRate, // keep original value like 18
      price: finalPrice, // includes GST
      isPublished,
      images,
      ...rest, // include size, color, variants, etc.
    };

    const product = await productService.createProduct(
      productInput,
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
    console.log("📩 Reached update product");

    const parsedData = updateProductSchema.parse(req.body);
    if (!req.userId) throw new AppError("Unauthorized", 401);

    let { name, basePrice, gstRate, ...rest } = parsedData;

    // ✅ Separate variable to avoid overwriting the original gstRate
    let finalGstRate: number | undefined = undefined;
    let price: number | undefined = undefined;

    if (typeof gstRate !== "undefined") {
      finalGstRate = gstRate / 100;
    }

    if (
      typeof basePrice !== "undefined" &&
      typeof finalGstRate !== "undefined"
    ) {
      price = basePrice + basePrice * finalGstRate;
    }

    const slug = name
      ? slugify(name, { lower: true, strict: true })
      : undefined;

    const updatedProductInput = {
      ...rest,
      ...(name && { name }),
      ...(slug && { slug }),
      ...(typeof basePrice !== "undefined" && { basePrice }),
      ...(typeof gstRate !== "undefined" && { gstRate }), // ✅ percentage value stored
      ...(typeof price !== "undefined" && { price }),
    };

    const updated = await productService.updateProduct(
      updatedProductInput,
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
export const getProductBySlug = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const isAdmin = req.user?.role === "admin"; // User ya Admin yahan check ho raha hai

    const product = await productService.getProductBySlug(
      req.params.slug,
      isAdmin // ← Ye flag service ko batata hai ki kaun request kar raha hai
    );

    res
      .status(200)
      .json(new ApiResponse(200, product, "Product fetched successfully"));
  }
);
// ✅ Get Single Product by ID (used in checkout, etc.)
export const getProductById = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const isAdmin = req.user?.role === "admin";
    const productId = req.params.productId;

    if (!productId) throw new AppError("Product ID is required", 400);

    const product = await productService.getProductById(productId, isAdmin);

    res
      .status(200)
      .json(
        new ApiResponse(200, product, "Product fetched by ID successfully")
      );
  }
);

// ✅ Get All Products
export const getAllProducts = catchAsync(
  async (_req: AuthRequest, res: Response) => {
    console.log("reached get product list");
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

//user controler
// Controller for public products
export const getPublishedProducts = catchAsync(
  async (req: AuthRequest, res: Response) => {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const products = await productService.getAllProducts(
      { isPublished: true },
      page,
      limit
    );

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          products,
          "Published products fetched successfully"
        )
      );
  }
);
