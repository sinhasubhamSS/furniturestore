import { Request, Response } from "express";
import Product from "../models/product.models";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";
import { AuthRequest } from "../types/app-request";
export const createProduct = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { name, title, description, price, stock, category } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!name || !title || !description || !price || !stock || !category) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    if (!Array.isArray(files) || files.length === 0) {
      res
        .status(400)
        .json({ message: "At least one product image is required" });
      return;
    }

    const uploadedResults = await Promise.all(
      files.map((file) => uploadToCloudinary(file.buffer, "products"))
    );
    const imageUrls = uploadedResults.map((result) => result.secure_url);

    const newProduct = new Product({
      name,
      title,
      description,
      price,
      stock,
      category,
      images: imageUrls,
      createdBy: req.user?._id, //
    });

    await newProduct.save();

    res
      .status(201)
      .json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
export const updateProduct = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, title, description, price, stock, category } = req.body;
    const files = req.files as Express.Multer.File[];

    if (!id) {
      res.status(400).json({ message: "Product ID is required" });
      return;
    }

    const product = await Product.findById(id);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    }

    // Optional: Upload new images if any
    let imageUrls = product.images;
    if (Array.isArray(files) && files.length > 0) {
      const uploadedResults = await Promise.all(
        files.map((file) => uploadToCloudinary(file.buffer, "products"))
      );
      imageUrls = uploadedResults.map((result) => result.secure_url);
    }

    product.name = name || product.name;
    product.title = title || product.title;
    product.description = description || product.description;
    product.price = price || product.price;
    product.stock = stock || product.stock;
    product.category = category || product.category;
    product.images = imageUrls;

    await product.save();

    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
