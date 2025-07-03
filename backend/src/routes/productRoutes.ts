
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
import upload from "../middlewares/multer";
import { authVerify } from "../middlewares/authVerify";
import { isAdmin } from "../middlewares/isAdmin";
const router = Router();

router.post(
  "/createproduct",
  authVerify,
  isAdmin,
  upload.array("images", 5),
  createProduct
);
router.put(
  "/editproduct/:productId",
  authVerify,
  isAdmin,
  upload.array("images", 5),
  updateProduct
);
router.delete("/deleteproduct/:productId", authVerify, isAdmin, deleteProduct);
router.get("/getallproducts", getAllProducts);
router.get("/getproductbyid/:productId", getProductById);
router.get("/search", searchProducts);
router.get("/category/:category", getProductsByCategory);
router.get("/latest-products", getLatestProducts);

export default router;
