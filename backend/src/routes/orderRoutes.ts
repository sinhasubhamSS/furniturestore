import { Router } from "express";
import { authVerify } from "../middlewares/authVerify";
import { isAdmin } from "../middlewares/isAdmin";
import {
  cancelOrderController,
  getCheckoutPricing,
  getMyOrders,
  placeOrder,
  updateOrderStatusController,
  getAllOrdersAdmin,
} from "../controllers/orderController";

const router = Router();

// ✅ PUBLIC ROUTES (No auth required)
router.post("/checkout-pricing", getCheckoutPricing);

// ✅ USER ROUTES (Authentication required)
router.post("/place-order", authVerify, placeOrder);
router.get("/my-orders", authVerify, getMyOrders);
router.post("/cancel", authVerify, cancelOrderController);

// ✅ ADMIN ROUTES - FIXED (Both authVerify AND isAdmin required)
router.get("/admin/all", authVerify, isAdmin, getAllOrdersAdmin);
router.put(
  "/admin/:orderId/status",
  authVerify,
  isAdmin,
  updateOrderStatusController
);
//                 ↑ First        ↑ Second    ↑ Third
//              (Auth Token)   (Check Role)  (Controller)

export default router;
