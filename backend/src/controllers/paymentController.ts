import { Request, Response, NextFunction } from "express";
import { catchAsync } from "../utils/catchAsync";
import { ApiResponse } from "../utils/ApiResponse";
import { paymentService } from "../services/paymentService";
import { PaymentMethodEnum, PaymentStatusEnum } from "../constants/enums";
import Payment from "../models/payment.models";
import { AppError } from "../utils/AppError";

export const createPaymentOrder = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { amount } = req.body;

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
