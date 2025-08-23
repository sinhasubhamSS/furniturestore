import { Router } from "express";
import { authVerify } from "../middlewares/authVerify";
import { cancelOrderController, getMyOrders, placeOrder, updateOrderStatusController,  } from "../controllers/orderController";
import { isAdmin } from "../middlewares/isAdmin";

const router = Router();

router.post("/placeorder", authVerify, placeOrder);

router.get("/myorders", authVerify, getMyOrders);
router.post("/cancel-order", authVerify, cancelOrderController);
router.post("/update-order-status/:orderId", authVerify,isAdmin, updateOrderStatusController);

export default router;
