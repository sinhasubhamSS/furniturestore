import Category from "../models/category.model";
import Product from "../models/product.models";
import { IProductInput } from "../types/productservicetype";
import { AppError } from "../utils/AppError";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

class ProductService {
  // ✅ Create Product
  async createProduct(parsedData: IProductInput, userId: string) {
    if (!Array.isArray(parsedData.images) || parsedData.images.length === 0) {
      throw new AppError("Images array is required", 400);
    }

    const newProduct = await Product.create({
      ...parsedData,
      createdBy: userId,
      isPublished: parsedData.isPublished ?? false,
    });

    return newProduct;
  }

  // ✅ Update Product
  async updateProduct(
    data: Partial<IProductInput>,
    files: Express.Multer.File[],
    productId: string,
    userId: string
  ) {
    const product = await Product.findOne({
      _id: productId,
      createdBy: userId,
    });
    if (!product) {
      throw new AppError("Product not found or unauthorized", 404);
    }

    Object.assign(product, data);

    if (files.length > 0) {
      const uploadedResults = await Promise.all(
        files.map((file) => uploadToCloudinary(file.buffer, "products"))
      );
      product.images = uploadedResults.map((res) => res.secure_url);
    }

    return await product.save();
  }

  // ✅ Delete Product
  async deleteProduct(productId: string, userId: string) {
    const product = await Product.findOneAndDelete({
      _id: productId,
      createdBy: userId,
    });
    if (!product) {
      throw new AppError("Product not found or unauthorized", 404);
    }
    return product;
  }

  // ✅ Get Single Product
  async getProductById(productId: string) {
    const product = await Product.findById(productId);
    if (!product) {
      throw new AppError("Product not found", 404);
    }
    return product;
  }

  // ✅ Get All Products
  async getAllProducts(filter = {}) {
    return await Product.find(filter).sort({ createdAt: -1 });
  }
  async searchProducts(query: string) {
    return await Product.find({
      $text: { $search: query },
    })
      .sort({ score: { $meta: "textScore" } }) // Sort by match relevance
      .select({ score: { $meta: "textScore" } }); // Optionally include score in result
  }

  async getProductsByCategory(slug: string, limit?: number) {
    const category = await Category.findOne({ slug });
    if (!category) throw new AppError("Category not found", 404);

    return await Product.find({ category: category._id })
      .sort({ createdAt: -1 })
      .limit(limit || 0)
      .lean();
  }
  async getLatestProducts(limit: number = 8) {
    return Product.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .select("name price images createdAt"); // Only necessary fields
  }
}
// ✅ Export instance
export const productService = new ProductService();
