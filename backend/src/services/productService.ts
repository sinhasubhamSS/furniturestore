import Product from "../models/product.models";
import { IProductInput } from "../types/productservicetype";
import { AppError } from "../utils/AppError";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

class ProductService {
  // ✅ Create Product
  async createProduct(
    parsedData: IProductInput,
    files: Express.Multer.File[],
    userId: string
  ) {
    if (!Array.isArray(files) || files.length === 0) {
      throw new AppError("At least one product image is required", 400);
    }

    const uploadedResults = await Promise.all(
      files.map((file) => uploadToCloudinary(file.buffer, "products"))
    );

    const imageUrls = uploadedResults.map((result) => result.secure_url);

    const newProduct = await Product.create({
      ...parsedData,
      images: imageUrls,
      createdBy: userId,
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
    const regex = new RegExp(query, "i");
    return await Product.find({
      $or: [{ name: { $regex: regex } }, { description: { $regex: regex } }],
    }).sort({ createdAt: -1 });
  }
  async getProductsByCategory(category: string) {
    return await Product.find({ category: category.trim() }).sort({
      createdAt: -1,
    });
  }
}
// ✅ Export instance
export const productService = new ProductService();
