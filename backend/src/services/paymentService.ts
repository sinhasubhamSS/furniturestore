import razorpay from "../utils/razorpayinstace";
import crypto from "crypto";
import { AppError } from "../utils/AppError";
import Product, { IVariant } from "../models/product.models";
interface VerifyAmountItem {
  productId: string;
  variantId: string;
  quantity: number;
}
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
  } //remove it when webhook is implemented

  // verifySignatureAndGetDetails	Payment signature verification & payment info fetch	Payment verify karte waqt (e.g., order place time)
  // verifyWebhookSignature	Webhook payload signature verification	Webhook endpoint par webhook verify karte waqt
  // src/services/paymentService.ts
  async verifyWebhookSignature(
    payloadBody: string,
    signature: string,
    secret: string
  ): Promise<boolean> {
    if (!signature || !secret) {
      throw new AppError("Missing webhook signature or secret", 400);
    }

    const generatedSignature = crypto
      .createHmac("sha256", secret)
      .update(payloadBody)
      .digest("hex");

    return generatedSignature === signature;
  }

  // ✅ SIMPLE: Only verify amount
  async verifyOrderAmount(items: VerifyAmountItem[]) {
    if (!items || items.length === 0) {
      throw new AppError("No items provided for verification", 400);
    }

    let totalAmount = 0;

    for (const item of items) {
      if (!item.productId || !item.variantId || item.quantity <= 0) {
        throw new AppError("Invalid item data", 400);
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        throw new AppError(`Product not found`, 404);
      }

      const variant = product.variants.find(
        (v: IVariant) => v._id?.toString() === item.variantId
      );

      if (!variant) {
        throw new AppError(`Variant not found`, 404);
      }

      // Basic stock check
      if (variant.stock < item.quantity) {
        throw new AppError(`Insufficient stock`, 400);
      }

      // Calculate price (same as OrderService)
      const actualPrice =
        variant.hasDiscount && variant.discountedPrice > 0
          ? variant.discountedPrice
          : variant.price;

      totalAmount += actualPrice * item.quantity;
    }

    return {
      totalAmount,
      verified: true,
    };
  }
}

export const paymentService = new PaymentService();
