import { Router } from "express";
import { authVerify } from "../middlewares/authVerify";
import { cancelOrderController, getMyOrders, placeOrder,  } from "../controllers/orderController";

const router = Router();

router.post("/placeorder", authVerify, placeOrder);

router.get("/myorders", authVerify, getMyOrders);
router.post("/cancel-order", authVerify, cancelOrderController);

export default router;
