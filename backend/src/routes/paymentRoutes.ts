import express from "express";
import {
  createPaymentOrder,
  verifyPayment,
} from "../controllers/paymentController";

const router = express.Router();

router.post("/create-order", createPaymentOrder); // /api/payment/order
router.post("/verify", verifyPayment); // /api/payment/verify

export default router;
