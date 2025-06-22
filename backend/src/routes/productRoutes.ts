import { Router } from "express";

import { createProduct, updateProduct } from "../controllers/productController";
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
export default router