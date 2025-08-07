import { FilterQuery, Types } from "mongoose";
import cloudinary from "../config/cloudinary";
import Category from "../models/category.model";
import Product from "../models/product.models";
import { IProductInput } from "../types/productservicetype";
import { AppError } from "../utils/AppError";
import slugify from "slugify";

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
  // Validate variants
  if (!productData.variants || productData.variants.length === 0) {
    throw new AppError("At least one variant is required", 400);
  }

  // Process variants
  const processedVariants = productData.variants.map(variant => {
    // Validate variant images
    if (!variant.images || variant.images.length === 0) {
      throw new AppError("Each variant must have at least one image", 400);
    }

    // Calculate final price
    const gstDecimal = variant.gstRate / 100;
    const finalPrice = variant.basePrice + variant.basePrice * gstDecimal;

    return {
      ...variant,
      price: finalPrice,
      stock: variant.stock || 0,
    };
  });

  // Compute product-level fields
  const minPrice = Math.min(...processedVariants.map(v => v.price));
  const totalStock = processedVariants.reduce((sum, v) => sum + v.stock, 0);
  const colors = [...new Set(processedVariants.map(v => v.color))];
  const sizes = [...new Set(processedVariants.map(v => v.size))];

  // Prepare product document
  const productDocument: IProductInput = {
    ...productData,
    slug: this.buildSlug(productData.name),
    variants: processedVariants,
    price: minPrice,
    stock: totalStock,
    colors,
    sizes,
    // createdBy: new Types.ObjectId(userId), // Convert string to ObjectId
    isPublished: productData.isPublished || false
  };

  // Create and return product
  return await Product.create(productDocument);
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
    return Product.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("name price images createdAt")
      .lean();
  }
}

export const productService = new ProductService();
