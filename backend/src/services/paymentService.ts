import razorpay from "../utils/razorpayinstace";
import crypto from "crypto";
import { AppError } from "../utils/AppError";

class PaymentService {
  async createOrder(amountInRupees: number) {
    if (!amountInRupees || amountInRupees <= 0) {
      throw new AppError("Amount must be greater than 0", 400);
    }

    const amountInPaise = Math.round(amountInRupees * 100); // round to nearest integer paise

    const options = {
      amount: amountInPaise, // integer paise me
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };
    console.log("📦 Razorpay create order options:", options);
    const order = await razorpay.orders.create(options);

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    };
  }

  async verifySignatureAndGetDetails({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      throw new AppError("Missing required payment fields", 400);
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      throw new AppError("Invalid payment signature", 400);
    }

    // ✅ fetch actual payment info from Razorpay
    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);

    return {
      verified: true,
      method: paymentDetails.method?.toUpperCase(), // e.g. "UPI"
    };
  }
}

export const paymentService = new PaymentService();
