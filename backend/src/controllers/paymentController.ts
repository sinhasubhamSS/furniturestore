import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/ApiResponse";
import { paymentService } from "../services/paymentService";
import { PaymentMethodEnum, PaymentStatusEnum } from "../constants/enums";
import Payment from "../models/payment.models";
import { AppError } from "../utils/AppError";

export const createPaymentOrder = catchAsync(
  async (req: Request, res: Response) => {
    const { amount } = req.body;
    console.log("📥 Received amount from frontend:", amount);
    if (!amount || typeof amount !== "number") {
      throw new AppError("Amount must be provided as number", 400);
    }

    const orderData = await paymentService.createOrder(amount);

    return res
      .status(200)
      .json(
        new ApiResponse(200, orderData, "Razorpay order created successfully")
      );
  }
);

export const verifyPayment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      amount,
      userId,
    } = req.body;

    // Assuming your service now returns the payment method as well
    const { verified, method }: { verified: boolean; method: string } =
      await paymentService.verifySignatureAndGetDetails({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });

    if (!verified) {
      throw new AppError("Signature verification failed", 400);
    }

    // Normalize & validate method
    const normalizedMethod = method.toUpperCase();
    if (
      !Object.values(PaymentMethodEnum).includes(
        normalizedMethod as PaymentMethodEnum
      )
    ) {
      throw new AppError(`Unsupported payment method: ${method}`, 400);
    }

    const payment = await Payment.create({
      orderId: razorpay_order_id,
      userId,
      paymentMethod: normalizedMethod as PaymentMethodEnum,
      paymentStatus: PaymentStatusEnum.PAID,
      transactionId: razorpay_payment_id,
      amount,
      provider: "RAZORPAY",
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { verified: true, payment },
          "Payment verified and saved"
        )
      );
  }
);

export const verifyPaymentAmount = catchAsync(
  async (req: Request, res: Response) => {
    const { items, expectedTotal } = req.body;

    console.log("📥 Verifying payment amount:", {
      itemsCount: items?.length,
      expectedTotal,
    });

    // Simple validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError("Items array is required", 400);
    }

    if (!expectedTotal || typeof expectedTotal !== "number") {
      throw new AppError("Expected total amount is required", 400);
    }

    const verificationResult = await paymentService.verifyPaymentAmount(
      items,
      expectedTotal
    );

    console.log(
      "✅ Payment amount verified:",
      verificationResult.calculatedTotal
    );

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          verificationResult,
          "Payment amount verified successfully"
        )
      );
  }
);
