// src/controllers/webhook.controller.ts
import { Request, Response } from "express";
import { paymentService } from "../services/paymentService";
import OrderService from "../services/orderService";
import { AppError } from "../utils/AppError";
import { ApiResponse } from "../utils/ApiResponse";

const orderService = new OrderService();

export async function handleRazorpayWebhook(
  req: Request,
  res: Response
): Promise<void> {
  try {
    console.log("🔔 Webhook received from Razorpay");

    const payload = req.body;
    const signature = (req.headers["x-razorpay-signature"] as string) || "";
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || "";

    if (!signature) {
      throw new AppError("Missing webhook signature", 400);
    }

    if (!secret) {
      throw new AppError("Webhook secret not configured", 500);
    }

    // 1. Signature verification
    console.log("🔐 Verifying webhook signature...");
    const isValid = await paymentService.verifyWebhookSignature(
      JSON.stringify(payload),
      signature,
      secret
    );

    if (!isValid) {
      throw new AppError("Invalid webhook signature", 400);
    }

    console.log("✅ Webhook signature verified");

    // 2. Handle payment.captured event only
    if (
      payload.event === "payment.captured" &&
      payload.payload.payment.entity.status === "captured"
    ) {
      console.log("💰 Processing payment.captured event");

      const razorpayOrderId = payload.payload.payment.entity.order_id;
      const razorpayPaymentId = payload.payload.payment.entity.id;

      if (!razorpayOrderId || !razorpayPaymentId) {
        throw new AppError("Missing required payment fields in webhook", 400);
      }

      // 3. Update order via OrderService
      const updatedOrder = await orderService.handleRazorpayWebhook({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: signature,
      });

      console.log("🎉 Order confirmed successfully via webhook");

      // 4. Success response using ApiResponse (NO RETURN)
      res.status(200).json(
        new ApiResponse(
          200,
          {
            orderId: updatedOrder._id,
            status: updatedOrder.status,
            paymentStatus: updatedOrder.paymentSnapshot?.status,
            razorpayPaymentId: razorpayPaymentId,
          },
          "Webhook processed and order confirmed successfully"
        )
      );
    } else {
      console.log(`⚠️ Ignoring event: ${payload.event}`);

      // For non-payment events, still return success (NO RETURN)
      res
        .status(200)
        .json(
          new ApiResponse(
            200,
            { event: payload.event },
            "Webhook received but no action required"
          )
        );
    }
  } catch (error: any) {
    console.error("❌ Webhook handling error:", error);

    // Let global error handler deal with AppError
    if (error instanceof AppError) {
      throw error;
    }

    // For unexpected errors
    throw new AppError("Internal webhook processing error", 500);
  }
}
