import { FilterQuery, Types } from "mongoose";
import cloudinary from "../config/cloudinary";
import Category from "../models/category.model";
import Product from "../models/product.models";
import { IProductInput } from "../types/productservicetype";
import { AppError } from "../utils/AppError";
import slugify from "slugify";
import { generateSKU } from "../utils/genetateSku";

class ProductService {
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

  async createProduct(productData: IProductInput, userId: string) {
    if (!productData.variants || productData.variants.length === 0) {
      throw new AppError("At least one variant is required", 400);
    }

    const processedVariants = productData.variants.map((variant) => {
      if (!variant.images || variant.images.length === 0) {
        throw new AppError("Each variant must have at least one image", 400);
      }

      // Generate SKU using shared util
      const sku = generateSKU(productData.name, variant.color, variant.size);

      // Calculate price with GST
      const gstDecimal = variant.gstRate / 100;
      const price = variant.basePrice + variant.basePrice * gstDecimal;

      // Calculate discounted price and savings
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

    // Calculate product-level stats
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
  // async updateProduct(
  //   data: Partial<IProductInput>,
  //   productId: string,
  //   userId: string
  // ) {
  //   const product = await Product.findOne({
  //     _id: productId,
  //     createdBy: userId,
  //   });
  //   if (!product) throw new AppError("Product not found or unauthorized", 404);

  //   if (data.name) {
  //     product.slug = this.buildSlug(data.name);
  //   }

  //   if (Array.isArray(data.images)) {
  //     await this.deleteRemovedImages(product.images, data.images);
  //     product.images = data.images;
  //   }

  //   if (typeof data.isPublished === "boolean") {
  //     product.isPublished = data.isPublished;
  //   }

  //   Object.assign(product, data);
  //   return await product.save();
  // }

  // ✅ Delete Product
  async deleteProduct(productId: string, userId: string) {
    const product = await Product.findOneAndDelete({
      _id: productId,
      createdBy: userId,
    });
    if (!product) throw new AppError("Product not found or unauthorized", 404);
    return product;
  }

  // ✅ Get Single Product
  private async getProduct(
    query: FilterQuery<IProductInput>,
    isAdmin: boolean
  ) {
    const product = await Product.findOne(query).lean<IProductInput>();

    if (!product) throw new AppError("Product not found", 404);

    if (!isAdmin && !product.isPublished) {
      throw new AppError("Product is not available", 403);
    }

    return product;
  }

  async getProductBySlug(slug: string, isAdmin = false) {
    return this.getProduct({ slug }, isAdmin);
  }

  async getProductById(productId: string, isAdmin = false) {
    return this.getProduct({ _id: productId }, isAdmin);
  }

  // ✅ Get All Products with Pagination
  async getAllProducts(filter = {}, page: number = 1, limit: number = 10) {
    const query = Product.find(filter)
      .populate("category", "name") // 👈 This line adds the category name
      .sort({ createdAt: -1 });

    const paginated = this.applyPagination(query, page, limit);

    const [products, total] = await Promise.all([
      paginated.lean(),
      Product.countDocuments(filter),
    ]);

    return {
      products,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    };
  }

  // ✅ Search Products
  async searchProducts(query: string, page = 1, limit = 10) {
    const searchQuery = Product.find({
      $text: { $search: query },
    })
      .sort({ score: { $meta: "textScore" } })
      .select({ score: { $meta: "textScore" } });

    const paginated = this.applyPagination(searchQuery, page, limit);
    const [products, total] = await Promise.all([
      paginated.lean(),
      Product.countDocuments({ $text: { $search: query } }),
    ]);

    return {
      products,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    };
  }

  // ✅ Get Products by Category (with optional pagination)
  async getProductsByCategory(slug: string, page = 1, limit = 10) {
    const category = await Category.findOne({ slug });
    if (!category) throw new AppError("Category not found", 404);

    const query = Product.find({ category: category._id }).sort({
      createdAt: -1,
    });
    const paginated = this.applyPagination(query, page, limit);

    const [products, total] = await Promise.all([
      paginated.lean(),
      Product.countDocuments({ category: category._id }),
    ]);

    return {
      products,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      totalItems: total,
    };
  }

  // ✅ Get Latest Products
  async getLatestProducts(limit: number = 8) {
    const products = await Product.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select(" slug variants createdAt")
      .lean();

    // Only return the first image and price from the first variant
    const modifiedProducts = products.map((product) => {
      const firstVariant = product.variants?.[0];

      return {
        _id: product._id,
        name: product.name,
        slug: product.slug,
        image: firstVariant?.images?.[0]?.url || "",
        price: firstVariant?.price,
        createdAt: product.createdAt,
      };
    });

    return modifiedProducts;
  }
}

export const productService = new ProductService();
