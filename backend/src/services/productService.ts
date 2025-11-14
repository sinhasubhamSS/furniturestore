import { FilterQuery, Types } from "mongoose";
import cloudinary from "../config/cloudinary";
import Category from "../models/category.model";
import Product from "../models/product.models";
import { IProductInput } from "../types/productservicetype";
import { AppError } from "../utils/AppError";
import slugify from "slugify";
import { generateSKU } from "../utils/genetateSku";
import { SortByOptions } from "../types/productservicetype";
import { IVariant } from "../types/productservicetype"; // Adjust the path as necessary

class ProductService {
  // ==================== PRIVATE/UTILITY METHODS ====================

  private buildSlug(name: string) {
    return slugify(name, { lower: true, strict: true });
  }

  private async deleteRemovedImages(
    oldImages: { public_id: string }[],
    newImages: { public_id: string }[]
  ) {
    const newIds = newImages.map((img) => img.public_id);
    const toDelete = oldImages.filter((img) => !newIds.includes(img.public_id));
    for (const img of toDelete) {
      try {
        await cloudinary.uploader.destroy(img.public_id);
      } catch (err) {
        console.error("Cloudinary deletion error:", err);
      }
    }
  }

  private applyPagination(query: any, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return query.skip(skip).limit(limit);
  }

  // ✅ CENTRALIZED QUERY BUILDER - DRY Principle
  private buildProductQuery(
    filter: FilterQuery<IProductInput> = {},
    isAdmin: boolean = false,
    populateCreatedBy: boolean = false
  ) {
    // Admin can see all, users only published
    const finalFilter = isAdmin ? filter : { ...filter, isPublished: true };

    let query = Product.find(finalFilter).populate("category", "name");

    if (populateCreatedBy) {
      query = query.populate("createdBy", "name email");
    }

    return query;
  }
  // ==================== PRIVATE/UTILITY METHODS ==================== में add करें

  private buildSortOptions(sortBy: string): { [key: string]: 1 | -1 } {
    switch (sortBy) {
      case "price_low":
        return { price: 1 }; // Lowest price first

      case "price_high":
        return { price: -1 }; // Highest price first

      case "discount":
        return { maxSavings: -1 }; // Highest savings first

      case "latest":
      default:
        return { createdAt: -1 }; // Newest first
    }
  }

  // ==================== ADMIN-ONLY METHODS ====================

  async createProduct(productData: IProductInput, userId: string) {
    if (!productData.variants || productData.variants.length === 0) {
      throw new AppError("At least one variant is required", 400);
    }

    const processedVariants = productData.variants.map((variant) => {
      if (!variant.images || variant.images.length === 0) {
        throw new AppError("Each variant must have at least one image", 400);
      }

      const sku = generateSKU(productData.name, variant.color, variant.size);
      const gstDecimal = variant.gstRate / 100;
      const price = variant.basePrice + variant.basePrice * gstDecimal;

      let discountedPrice = price;
      let savings = 0;
      const isDiscountValid =
        variant.hasDiscount &&
        variant.discountPercent > 0 &&
        (!variant.discountValidUntil ||
          new Date(variant.discountValidUntil) > new Date());

      if (isDiscountValid) {
        const discountAmount =
          (variant.basePrice * variant.discountPercent) / 100;
        const discountedBasePrice = variant.basePrice - discountAmount;
        discountedPrice =
          discountedBasePrice + discountedBasePrice * gstDecimal;
        savings = price - discountedPrice;
      }

      return {
        ...variant,
        sku,
        price: Math.round(price * 100) / 100,
        discountedPrice: Math.round(discountedPrice * 100) / 100,
        savings: Math.round(savings * 100) / 100,
        stock: variant.stock || 0,
      };
    });

    const minPrice = Math.min(...processedVariants.map((v) => v.price));
    const minDiscountedPrice = Math.min(
      ...processedVariants.map((v) => v.discountedPrice)
    );
    const maxSavings = Math.max(...processedVariants.map((v) => v.savings));
    const colors = [...new Set(processedVariants.map((v) => v.color))];
    const sizes = [...new Set(processedVariants.map((v) => v.size))];

    const productDocument: IProductInput = {
      ...productData,
      slug: this.buildSlug(productData.name),
      variants: processedVariants,
      price: minPrice,
      lowestDiscountedPrice: minDiscountedPrice,
      maxSavings,
      colors,
      sizes,
      createdBy: new Types.ObjectId(userId),
      isPublished: productData.isPublished || false,
    };

    const product = await Product.create(productDocument);
    return product;
  }

  async editProduct(
    productId: string,
    userId: string,
    updateData: Partial<IProductInput>
  ) {
    const product = await Product.findOne({
      _id: productId,
      createdBy: userId,
    });
    if (!product) throw new AppError("Product not found or unauthorized", 404);

    // Update slug on name change
    if (updateData.name && updateData.name !== product.name) {
      product.slug = this.buildSlug(updateData.name);
    }

    // Variants update handling
    if (updateData.variants) {
      if (updateData.variants.length === 0) {
        throw new AppError("At least one variant is required", 400);
      }

      // Delete images removed in update for each old variant compared to new
      for (let i = 0; i < product.variants.length; i++) {
        const oldVariant = product.variants[i];
        const newVariant = updateData.variants[i];
        if (newVariant) {
          await this.deleteRemovedImages(oldVariant.images, newVariant.images);
        } else {
          await this.deleteRemovedImages(oldVariant.images, []);
        }
      }

      // Recalculate pricing and fields for each new variant
      const processedVariants: IVariant[] = updateData.variants.map(
        (variant) => {
          if (!variant.images || variant.images.length === 0) {
            throw new AppError(
              "Each variant must have at least one image",
              400
            );
          }

          const sku = generateSKU(
            updateData.name || product.name,
            variant.color,
            variant.size
          );
          const gstDecimal = variant.gstRate / 100;
          const price = variant.basePrice + variant.basePrice * gstDecimal;

          let discountedPrice = price;
          let savings = 0;
          const isDiscountValid =
            variant.hasDiscount &&
            variant.discountPercent > 0 &&
            (!variant.discountValidUntil ||
              new Date(variant.discountValidUntil) > new Date());

          if (isDiscountValid) {
            const discountAmount =
              (variant.basePrice * variant.discountPercent) / 100;
            const discountedBasePrice = variant.basePrice - discountAmount;
            discountedPrice =
              discountedBasePrice + discountedBasePrice * gstDecimal;
            savings = price - discountedPrice;
          }

          return {
            ...variant,
            sku,
            price: Math.round(price * 100) / 100,
            discountedPrice: Math.round(discountedPrice * 100) / 100,
            savings: Math.round(savings * 100) / 100,
            stock: variant.stock || 0,
          };
        }
      );

      // Assign variants with Mongoose DocumentArray .set()
      product.variants.splice(0, product.variants.length, ...processedVariants);

      // Update aggregate fields
      product.price = Math.min(...processedVariants.map((v) => v.price ?? 0));
      product.lowestDiscountedPrice = Math.min(
        ...processedVariants.map((v) => v.discountedPrice ?? 0)
      );
      product.maxSavings = Math.max(
        ...processedVariants.map((v) => v.savings ?? 0)
      );
      product.colors = [...new Set(processedVariants.map((v) => v.color))];
      product.sizes = [...new Set(processedVariants.map((v) => v.size))];
    }

    // Fields allowed to be updated
    const updatableFields: (keyof IProductInput)[] = [
      "name",
      "title",
      "description",
      "specifications",
      "measurements",
      "warranty",
      "disclaimer",
      "category",
      "isPublished",
    ];

    // Apply updates
    updatableFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        (product as any)[field] = updateData[field];
      }
    });

    await product.save();

    return product.toObject();
  }

  async deleteProduct(productId: string, userId: string) {
    const product = await Product.findOneAndDelete({
      _id: productId,
      createdBy: userId,
    });
    if (!product) throw new AppError("Product not found or unauthorized", 404);
    return product;
  }

  // ==================== UNIFIED GET METHODS ====================

  /**
   * ✅ UNIFIED - Get all products with filters
   * @param filter - MongoDB filter object
   * @param page - Page number
   * @param limit - Items per page
   * @param isAdmin - Admin access flag
   * @param populateCreatedBy - Whether to populate creator info
   */
  // ProductService.js - Debug getAllProducts method
  // service: src/services/product.service.ts (or your service class file)
  // Make sure Product and Category models are imported correctly in this file.

  async getAllProducts(
    filter: any = {},
    page: number = 1,
    limit: number = 10,
    isAdmin: boolean = false,
    populateCreatedBy: boolean = false,
    sortBy: string = "latest"
  ) {
    const mongoFilter: any = {};

    // Handle category filter - convert slug to ObjectId
    if (filter.category) {
      const category = await Category.findOne({ slug: filter.category });
      if (category) {
        mongoFilter.category = category._id;
      } else {
        return {
          products: [],
          page,
          limit,
          totalPages: 0,
          totalItems: 0,
        };
      }
    }

    // Build dynamic sort options (use your existing helper)
    const sortOptions = this.buildSortOptions(sortBy);

    // SIMPLE fixed projection for listing (keeps payload small)
    // service: src/services/product.service.ts

// SIMPLE fixed projection for listing (ensure variants.images included)
const LISTING_PROJECTION: any = {
  _id: 1,
  slug: 1,
  name: 1,
  title: 1,
  // do NOT project category.* here to avoid path collision with populate()
  // category will be filled by populate('category', 'name')
  "variants._id": 1,
  "variants.images": 1,
  "variants.basePrice": 1,
  "variants.price": 1,
  "variants.stock": 1,
  createdAt: 1,
  updatedAt: 1,
};

    // Build base query using existing builder (this.buildProductQuery)
    let query = this.buildProductQuery(mongoFilter, isAdmin, populateCreatedBy);

    // Apply projection, sort, pagination
    query = query.select(LISTING_PROJECTION).sort(sortOptions);

    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    // Execute queries in parallel and use lean() for performance
    const [products, total] = await Promise.all([
      query.lean(),
      Product.countDocuments(mongoFilter),
    ]);

    // Trim variants array to only first variant for listing to reduce payload
    const trimmedProducts = (products || []).map((p: any) => {
      if (Array.isArray(p.variants) && p.variants.length > 1) {
        p.variants = [p.variants[0]];
      }
      // Normalize category object to { _id, name } if it's populated
      if (p.category && typeof p.category === "object") {
        p.category = {
          _id: p.category._id,
          name: p.category.name ?? p.category,
        };
      }
      return p;
    });

    return {
      products: trimmedProducts,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      totalItems: total,
    };
  }

  /**
   * ✅ UNIFIED - Get single product by query
   */
  private async getSingleProduct(
    query: FilterQuery<IProductInput>,
    isAdmin: boolean = false
  ) {
    const finalQuery = isAdmin ? query : { ...query, isPublished: true };

    const product = await this.buildProductQuery(finalQuery, isAdmin)
      .findOne()
      .lean();

    if (!product) throw new AppError("Product not found", 404);
    return product;
  }

  async getProductBySlug(slug: string, isAdmin: boolean = false) {
    return this.getSingleProduct({ slug }, isAdmin);
  }

  async getProductById(productId: string, isAdmin: boolean = false) {
    return this.getSingleProduct({ _id: productId }, isAdmin);
  }

  /**
   * ✅ UNIFIED - Search products
   */
  async searchProducts(
    searchQuery: string,
    page = 1,
    limit = 10,
    isAdmin: boolean = false
  ) {
    const textSearchFilter = {
      $text: { $search: searchQuery },
    };

    const query = this.buildProductQuery(textSearchFilter, isAdmin)
      .sort({ score: { $meta: "textScore" } })
      .select({ score: { $meta: "textScore" } });

    const paginated = this.applyPagination(query, page, limit);

    const finalFilter = isAdmin
      ? textSearchFilter
      : { ...textSearchFilter, isPublished: true };

    const [products, total] = await Promise.all([
      paginated.lean(),
      Product.countDocuments(finalFilter),
    ]);

    return {
      products,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    };
  }

  /**
   * ✅ UNIFIED - Get products by category
   */
  async getProductsByCategory(
    slug: string,
    page = 1,
    limit = 10,
    isAdmin: boolean = false
  ) {
    const category = await Category.findOne({ slug });
    if (!category) throw new AppError("Category not found", 404);

    const categoryFilter = { category: category._id };

    const query = this.buildProductQuery(categoryFilter, isAdmin).sort({
      createdAt: -1,
    });

    const paginated = this.applyPagination(query, page, limit);

    const finalFilter = isAdmin
      ? categoryFilter
      : { ...categoryFilter, isPublished: true };

    const [products, total] = await Promise.all([
      paginated.lean(),
      Product.countDocuments(finalFilter),
    ]);

    return {
      products,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    };
  }

  /**
   * ✅ Get latest products
   */
  async getLatestProducts(limit: number = 8, isAdmin: boolean = false) {
    const products = await this.buildProductQuery({}, isAdmin)
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("name slug variants category createdAt")
      .lean();

    // Return optimized data for frontend
    return products.map((product) => {
      const firstVariant = product.variants?.[0];

      return {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        category: product.category,
        image: firstVariant?.images?.[0]?.url || "",
        price: firstVariant?.price,
        discountedPrice: firstVariant?.discountedPrice,
        hasDiscount: firstVariant?.hasDiscount,
        createdAt: product.createdAt,
      };
    });
  }

  /**
   * ✅ Get featured/trending products
   */
  async getFeaturedProducts(limit: number = 8, isAdmin: boolean = false) {
    const featuredFilter = {
      "reviewStats.averageRating": { $gte: 4 },
    };

    return await this.buildProductQuery(featuredFilter, isAdmin)
      .sort({
        "reviewStats.averageRating": -1,
        "reviewStats.totalReviews": -1,
      })
      .limit(limit)
      .lean();
  }

  // ==================== ADMIN SPECIFIC SHORTCUTS ====================

  async getAllProductsAdmin(filter = {}, page: number = 1, limit: number = 10) {
    return this.getAllProducts(filter, page, limit, true, true); // Admin + populate creator
  }

  async getProductByIdAdmin(productId: string) {
    return this.getProductById(productId, true);
  }
}

export const productService = new ProductService();
