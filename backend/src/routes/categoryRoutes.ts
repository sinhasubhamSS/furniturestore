import { Router } from "express";
import {
  createCategory,
  getAllCategories,
} from "../controllers/categoryController";
import { authVerify } from "../middlewares/authVerify";
import { isAdmin } from "../middlewares/isAdmin";
import { upload } from "../middlewares/multer"; // assuming you have this
const router = Router();
router.post(
  "/create",
  authVerify,
  isAdmin,
  upload.single("image"),
  createCategory
);
router.get("/", getAllCategories); 
export default router;
