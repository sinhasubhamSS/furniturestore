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

  // ✅ Create Product
  async createProduct(parsedData: IProductInput, userId: string) {
    if (!Array.isArray(parsedData.images) || parsedData.images.length === 0) {
      throw new AppError("Images array is required", 400);
    }

    return await Product.create({
      ...parsedData,
      createdBy: userId,
      isPublished: parsedData.isPublished ?? false,
      slug: this.buildSlug(parsedData.name),
    });
  }

  // ✅ Update Product
  async updateProduct(
    data: Partial<IProductInput>,
    productId: string,
    userId: string
  ) {
    const product = await Product.findOne({
      _id: productId,
      createdBy: userId,
    });
    if (!product) throw new AppError("Product not found or unauthorized", 404);

    if (data.name) {
      product.slug = this.buildSlug(data.name);
    }

    if (Array.isArray(data.images)) {
      await this.deleteRemovedImages(product.images, data.images);
      product.images = data.images;
    }

    if (typeof data.isPublished === "boolean") {
      product.isPublished = data.isPublished;
    }

    Object.assign(product, data);
    return await product.save();
  }

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
  async getProductBySlug(slug: string, isAdmin = false) {
    const product = await Product.findOne({ slug }).lean<IProductInput>();

    if (!product) throw new AppError("Product not found", 404);

    // 👇 Agar admin nahi hai aur product published nahi hai to error do
    if (!isAdmin && !product.isPublished) {
      throw new AppError("Product is not available", 403);
    }

    return product;
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
