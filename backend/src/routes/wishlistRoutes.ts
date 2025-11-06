import { Router } from "express";
import { authVerify } from "../middlewares/authVerify";
import {
  addToWishlist,
  getWishlist,
  isInWishlist,
  removeFromWishlist,
  getWishlistWithProducts,
} from "../controllers/wishlistController";

const router = Router();

router.post("/add", authVerify, addToWishlist);
router.delete("/remove", authVerify, removeFromWishlist);
router.get("/",  getWishlist);
router.get("/check", isInWishlist);

// Full products with populate
router.get("/products", authVerify, getWishlistWithProducts);

export default router;
