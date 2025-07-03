import { Router } from "express";
import { authVerify } from "../middlewares/authVerify";
import { placeOrder, placeOrderFromCart } from "../controllers/orderController";

const router = Router();

router.post("/placeorder", authVerify, placeOrder);
router.post("/placeorderfromcart", authVerify, placeOrderFromCart);

export default router;
