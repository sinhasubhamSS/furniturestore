import Product from "../models/product.models";
import { IProductInput } from "../types/productservicetype";
import { uploadToCloudinary } from "../utils/cloudinaryUpload";

export const createProductService = async (
  parsedData: IProductInput,
  files: Express.Multer.File[],
  userId: string
) => {
  if (!Array.isArray(files) || files.length === 0) {
    throw new Error("At least one product image is required");
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
};
