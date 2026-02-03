import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getAllProducts,
  getAllProductsAdmin,
  getProductBySlug,
  getProductById,
  searchProducts,
  getProductsByCategory,
  getLatestProducts,
  editProduct,
  getProductByIdAdmin,
  getProductSlugs,
} from "../controllers/productController";
import { authVerify } from "../middlewares/authVerify";
import { isAdmin } from "../middlewares/isAdmin";

const router = Router();

// ==================== ADMIN ROUTES ====================
router.post("/admin/create", authVerify, isAdmin, createProduct);
router.put("/admin/edit/:productId", authVerify, isAdmin, editProduct);
router.delete("/admin/delete/:productId", authVerify, isAdmin, deleteProduct);
router.get("/admin/all", authVerify, isAdmin, getAllProductsAdmin);
router.get("/admin/id/:productId", authVerify, isAdmin, getProductByIdAdmin);
// ==================== PUBLIC ROUTES ====================
router.get("/all", getAllProducts); // Public + Admin both can access
router.get("/search", searchProducts);
router.get("/latest", getLatestProducts);
router.get("/category/:slug", getProductsByCategory);
router.get("/slug/:slug", getProductBySlug);
router.get("/id/:productId", getProductById);
router.get("/slugs", getProductSlugs);
export default router;
