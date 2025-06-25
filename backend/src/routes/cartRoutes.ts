import { Router } from "express";
import { authVerify } from "../middlewares/authVerify";
import {
  addToCart,
  clearCart,
  getCart,
  getCartCount,
  removeItem,
  updateQuantity,
} from "../controllers/cartController";

const router = Router();
router.post("/add", authVerify, addToCart); 
router.get("/", authVerify, getCart); 
router.patch("/update", authVerify, updateQuantity); 
router.delete("/remove", authVerify, removeItem); 
router.delete("/clear", authVerify, clearCart); 
router.get("/count", authVerify, getCartCount);
export default router;
