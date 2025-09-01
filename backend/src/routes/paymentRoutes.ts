import express from "express";
import {
  createPaymentOrder,
  // verifyPaymentAmount,
  verifyPayment,
} from "../controllers/paymentController";

const router = express.Router();

router.post("/create-order", createPaymentOrder); // /api/payment/order
router.post("/verify", verifyPayment); // /api/payment/verify
// router.post("/verify-amount", verifyPaymentAmount); // /api/payment/verify-order-amount

export default router;
