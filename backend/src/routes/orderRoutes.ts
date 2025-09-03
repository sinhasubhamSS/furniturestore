import { Router } from "express";
import { authVerify } from "../middlewares/authVerify";
import {
  cancelOrderController,
  getCheckoutPricing,
  getMyOrders,
  placeOrder,
  updateOrderStatusController,
} from "../controllers/orderController";
import { isAdmin } from "../middlewares/isAdmin";

const router = Router();

// ✅ User Routes
router.post("/place-order", authVerify, placeOrder); // ✅ Better naming
router.get("/my-orders", authVerify, getMyOrders); // ✅ Better naming
router.post("/cancel", authVerify, cancelOrderController); // ✅ Cleaner URL

// ✅ Admin Routes
router.put(
  "/:orderId/status", // ✅ FIX: Use PUT instead of POST for updates
  isAdmin,
  updateOrderStatusController
);

// ✅ Pricing Route (can be used before auth for cart pricing)
router.post("/checkout-pricing", getCheckoutPricing); // ✅ Remove authVerify - optional

export default router;
