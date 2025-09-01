import razorpay from "../utils/razorpayinstace";
import crypto from "crypto";
import { AppError } from "../utils/AppError";
import Product, { IVariant } from "../models/product.models";
import { PlaceOrderItem, PlaceOrderPayment } from "../types/orderservicetypes";
// import OrderService from "./orderService";

class PaymentService {
  // private orderService = new OrderService();
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
// async verifyPaymentAmount(
//   items: { productId: string; quantity: number; variantId?: string }[],
//   expectedTotal: number,
//   payment: PlaceOrderPayment,
//   pincode: string
// ) {
//   // Step 1: Validate inputs
//   if (!items || items.length === 0) {
//     throw new AppError("No items provided for verification", 400);
//   }

//   if (!pincode || !/^\d{6}$/.test(pincode)) {
//     throw new AppError("Valid 6-digit pincode is required", 400);
//   }

//   // ✅ SIMPLE FIX: Use existing calculateDisplayPricing method directly
//   const pricing = await this.orderService.calculateDisplayPricing(items, pincode);

//   // ✅ FIXED: Calculate total based on payment method
//   let calculatedTotal = 0;
//   let paymentTypeDesc = "";

//   switch (payment.method) {
//     case "RAZORPAY":
//       if (payment.isAdvance) {
//         // Advance payment: advance amount + packaging + delivery
//         calculatedTotal = pricing.advanceAmount + pricing.packagingFee + pricing.deliveryCharge;
//         paymentTypeDesc = "Advance Payment (10%)";
//       } else {
//         // Full online payment: subtotal + packaging + delivery
//         calculatedTotal = pricing.checkoutTotal;
//         paymentTypeDesc = "Online Full Payment";
//       }
//       break;

//     case "COD":
//       // COD: subtotal + packaging + delivery + COD fee
//       calculatedTotal = pricing.codTotal;
//       paymentTypeDesc = "Cash on Delivery";
//       break;

//     default:
//       throw new AppError("Invalid payment method", 400);
//   }

//   // ✅ FIXED: Payment method constraints
//   if (payment.method === "COD" && !pricing.deliveryInfo.codAvailable) {
//     throw new AppError(
//       "COD is not available for this delivery location",
//       400
//     );
//   }

//   if (payment.isAdvance && payment.method === "COD") {
//     throw new AppError(
//       "Advance payment cannot be COD. Please use online payment.",
//       400
//     );
//   }

//   if (payment.isAdvance && !pricing.advanceEligible) {
//     throw new AppError(
//       "Advance payment requires minimum order of ₹15,000",
//       400
//     );
//   }

//   // ✅ FIXED: Verify against expected amount
//   const tolerance = 0.01;
//   const verified = Math.abs(calculatedTotal - expectedTotal) <= tolerance;

//   if (!verified) {
//     throw new AppError(
//       `${paymentTypeDesc} amount mismatch. Expected: ₹${expectedTotal.toFixed(2)}, Calculated: ₹${calculatedTotal.toFixed(2)}`,
//       400
//     );
//   }

//   return {
//     verified: true,
//     calculatedTotal,
//     calculatedSubtotal: pricing.subtotal,
//     itemsVerified: items.length,
//     paymentMethod: payment.method,
//     isAdvance: payment.isAdvance || false,
//     breakdown: {
//       subtotal: pricing.subtotal,
//       packagingFee: pricing.packagingFee,
//       deliveryCharge: pricing.deliveryCharge,
//       codHandlingFee: pricing.codHandlingFee,
//       advanceAmount: pricing.advanceAmount,
//       remainingAmount: pricing.remainingAmount,
//     }
//   };
// }

}

export const paymentService = new PaymentService();
