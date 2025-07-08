// updateProductImages,
// softDeleteProduct,
// paginateProducts,

import { Router } from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
  getProductById,
  searchProducts,
  getProductsByCategory,
  getLatestProducts,
} from "../controllers/productController";

import { authVerify } from "../middlewares/authVerify";
import { isAdmin } from "../middlewares/isAdmin";
const router = Router();

router.post("/createproduct", authVerify, isAdmin, createProduct);
router.put("/editproduct/:productId", authVerify, isAdmin, updateProduct);
router.delete("/deleteproduct/:productId", authVerify, isAdmin, deleteProduct);
router.get("/admin/getallproducts",authVerify,isAdmin, getAllProducts);
router.get("/getproductbyid/:productId", getProductById);
router.get("/search", searchProducts);
router.get("/category/:slug", getProductsByCategory);
router.get("/latest-products", getLatestProducts);

export default router;
