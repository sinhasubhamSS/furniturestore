// updateProductImages,
// softDeleteProduct,
// paginateProducts,

import { Router } from "express";
import {
  createProduct,
  // updateProduct,
  deleteProduct,
  getAllProducts,
  getProductBySlug,
  searchProducts,
  getProductsByCategory,
  getLatestProducts,
  getPublishedProducts,
  getProductById,
} from "../controllers/productController";

import { authVerify } from "../middlewares/authVerify";
import { isAdmin } from "../middlewares/isAdmin";
const router = Router();

router.post("/createproduct", authVerify, isAdmin, createProduct);
// router.put("/editproduct/:productId", authVerify, isAdmin, updateProduct);
router.delete("/deleteproduct/:productId", authVerify, isAdmin, deleteProduct);
router.get("/admin/getallproducts", authVerify, isAdmin, getAllProducts);

router.get("/search", searchProducts);
router.get("/category/:slug", getProductsByCategory);
router.get("/latest-products", getLatestProducts);
router.get("/getproductbyslug/:slug", getProductBySlug);
router.get("/getproductbyid/:productId", getProductById);

//user
router.get("/published-products", getPublishedProducts);
export default router;
