// routes/cart.routes.ts
import { Router } from "express";
import { 
  addToCart, 
  getCart, 
  updateQuantity, 
  removeItem, 
  clearCart, 
  getCartCount 
} from "../controllers/cartController";
import { authVerify } from "../middlewares/authVerify";


const router = Router();

// ✅ All routes now support variants
router.post("/add", authVerify, addToCart);           // { productId, variantId, quantity }
router.get("/", authVerify, getCart);
router.put("/update", authVerify, updateQuantity);    // { productId, variantId, quantity }
router.delete("/remove", authVerify, removeItem);     // { productId, variantId }
router.delete("/clear", authVerify, clearCart);
router.get("/count", authVerify, getCartCount);

export default router;
