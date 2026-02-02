import { Router } from "express";
import {
  createCategory,
  getAllCategories,
  getCategorySlugs,
} from "../controllers/categoryController";
import { authVerify } from "../middlewares/authVerify";
import { isAdmin } from "../middlewares/isAdmin";
const router = Router();
router.post("/create", authVerify, isAdmin, createCategory);
router.get("/", getAllCategories);
router.get("/slugs", getCategorySlugs);
export default router;
