import { Router } from "express";
import { authVerify } from "../middlewares/authVerify";
import { placeOrder } from "../controllers/orderController";

const router = Router();

router.post("/placeorder", authVerify, placeOrder);

export default router;
