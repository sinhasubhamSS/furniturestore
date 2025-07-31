import { Router } from "express";
import { authVerify } from "../middlewares/authVerify";
import { getMyOrders, placeOrder,  } from "../controllers/orderController";

const router = Router();

router.post("/placeorder", authVerify, placeOrder);

router.get("/myorders", authVerify, getMyOrders);

export default router;
