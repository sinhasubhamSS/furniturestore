import razorpay from "../utils/razorpayinstace";
import crypto from "crypto";
import { AppError } from "../utils/AppError";
import Product, { IVariant } from "../models/product.models";
import { PlaceOrderItem, PlaceOrderPayment } from "../types/orderservicetypes";

class PaymentService {
  async createOrder(amountInRupees: number) {
    if (!amountInRupees || amountInRupees <= 0) {
      throw new AppError("Amount must be greater than 0", 400);
    }

    const amountInPaise = Math.round(amountInRupees * 100);
    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `receipt_order_${Date.now()}`,
    };

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

    const paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    return {
      verified: true,
      method: paymentDetails.method?.toUpperCase(),
    };
  }

  // ✅ SIMPLE - Only verify payment amount, no address needed
  async verifyPaymentAmount(items: PlaceOrderItem[], expectedTotal: number) {
    // Step 1: Verify items and calculate amount
    if (!items || items.length === 0) {
      throw new AppError("No items provided for verification", 400);
    }

    let calculatedTotal = 0;

    for (const item of items) {
      if (!item.productId || item.quantity <= 0) {
        throw new AppError("Invalid item data", 400);
      }

      const product = await Product.findById(item.productId);
      if (!product) {
        throw new AppError(`Product not found: ${item.productId}`, 404);
      }

      // Handle optional variantId
      let selectedVariant;
      if (item.variantId) {
        selectedVariant = product.variants.find(
          (v: IVariant) => v._id?.toString() === item.variantId
        );
      } else {
        selectedVariant = product.variants[0];
      }

      if (!selectedVariant) {
        throw new AppError(
          `Variant not found for product: ${product.name}`,
          404
        );
      }

      // Stock validation
      const availableStock =
        selectedVariant.stock - (selectedVariant.reservedStock || 0);
      if (availableStock < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${product.name}. Available: ${availableStock}`,
          400
        );
      }

      // Price calculation
      const actualPrice =
        selectedVariant.hasDiscount && selectedVariant.discountedPrice > 0
          ? selectedVariant.discountedPrice
          : selectedVariant.price;

      calculatedTotal += actualPrice * item.quantity;
    }

    // Step 2: Verify against expected amount
    const verified = Math.abs(calculatedTotal - expectedTotal) <= 0.01;

    if (!verified) {
      throw new AppError(
        `Amount mismatch. Expected: ₹${expectedTotal}, Calculated: ₹${calculatedTotal}`,
        400
      );
    }

    return {
      verified: true,
      calculatedTotal,
      itemsVerified: items.length,
    };
  }
}

export const paymentService = new PaymentService();
