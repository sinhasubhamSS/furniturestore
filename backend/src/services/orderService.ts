// src/services/orderService.ts
import Product, { IVariant } from "../models/product.models";
import {
  generateStandardOrderId,
  Order,
  OrderStatus,
} from "../models/order.models";
import { Return } from "../models/return.models";
import {
  PlaceOrderPayment,
  PlaceOrderRequest,
} from "../types/orderservicetypes";
import { Cart } from "../models/cart.model";
import { paymentService } from "./paymentService";
import { AppError } from "../utils/AppError";
import mongoose, { Types } from "mongoose";
import { HybridDeliveryService } from "./hybrid-deliveryService";
import { DeliveryCalculator } from "../utils/DeliveryCalculator/DeliveryCalculator";

class OrderService {
  // Order status transition rules
  private allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    [OrderStatus.Pending]: [
      OrderStatus.Confirmed,
      OrderStatus.Cancelled,
      OrderStatus.Failed,
    ],
    [OrderStatus.Confirmed]: [
      OrderStatus.Shipped,
      OrderStatus.Cancelled,
      OrderStatus.Failed,
    ],
    [OrderStatus.Shipped]: [OrderStatus.OutForDelivery, OrderStatus.Failed],
    [OrderStatus.OutForDelivery]: [OrderStatus.Delivered, OrderStatus.Failed],
    [OrderStatus.Delivered]: [],
    [OrderStatus.Cancelled]: [],
    [OrderStatus.Refunded]: [],
    [OrderStatus.Failed]: [],
  };

  /**
   * Build order items snapshot with weight tracking and stock reservation
   */
  private async buildOrderItems(
    items: { productId: string; quantity: number; variantId?: string }[],
    session: mongoose.ClientSession
  ) {
    const orderItemsSnapshot = [];
    let totalAmount = 0;
    let totalWeight = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        throw new AppError(`Product not found: ${item.productId}`, 404);
      }

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
          400
        );
      }

      const availableStock =
        selectedVariant.stock - (selectedVariant.reservedStock || 0);

      if (availableStock < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${product.name} (${selectedVariant.color}, ${selectedVariant.size}). Available: ${availableStock}`,
          400
        );
      }

      const finalPrice =
        selectedVariant.hasDiscount && selectedVariant.discountedPrice > 0
          ? selectedVariant.discountedPrice
          : selectedVariant.price;

      const itemTotal = finalPrice * item.quantity;
      totalAmount += itemTotal;

      // ✅ SAFE: Get weight from product measurements with optional chaining
      const productWeight = product.measurements?.weight ?? 1; // Default 1kg
      totalWeight += productWeight * item.quantity;

      orderItemsSnapshot.push({
        productId: product._id,
        variantId: selectedVariant._id,
        name: product.name,
        image: selectedVariant.images?.[0]?.url || "",
        quantity: item.quantity,
        price: finalPrice,
        hasDiscount: selectedVariant.hasDiscount,
        discountPercent: selectedVariant.discountPercent || 0,
        color: selectedVariant.color,
        size: selectedVariant.size,
        sku: selectedVariant.sku,
        weight: productWeight, // Individual item weight
      });

      // Reserve stock
      if (!selectedVariant.reservedStock) {
        selectedVariant.reservedStock = 0;
      }
      selectedVariant.reservedStock += item.quantity;
      await product.save({ session });
    }

    return { orderItemsSnapshot, totalAmount, totalWeight };
  }

  /**
   * Calculate delivery charges based on pincode, weight, and order value
   */
  private async calculateDeliveryCharges(
    pincode: string,
    weight: number,
    orderValue: number
  ) {
    const deliveryInfo = await HybridDeliveryService.checkDeliverability(
      pincode
    );

    if (!deliveryInfo.isServiceable) {
      throw new AppError(
        `Delivery not available for pincode ${pincode}. ${deliveryInfo.message}`,
        400
      );
    }

    const charges = DeliveryCalculator.calculateCharges(
      deliveryInfo,
      weight,
      orderValue
    );

    return {
      zone: deliveryInfo.zone,
      estimatedDays: deliveryInfo.deliveryDays,
      courierPartner: deliveryInfo.courierPartner,
      codAvailable: deliveryInfo.codAvailable,
      ...charges,
    };
  }

  /**
   * Confirm stock reservation - convert reserved stock to actual stock deduction
   */
  private async confirmReservation(
    orderId: string,
    session?: mongoose.ClientSession
  ) {
    const order = await Order.findById(orderId).session(session || null);
    if (!order) return;

    for (const item of order.orderItemsSnapshot) {
      const product = await Product.findById(item.productId).session(
        session || null
      );
      if (product && item.variantId) {
        const variant = product.variants.find(
          (v: IVariant) => v._id?.toString() === item.variantId?.toString()
        );

        if (variant) {
          // Deduct from actual stock and reduce reserved stock
          variant.stock -= item.quantity;
          variant.reservedStock = Math.max(
            0,
            (variant.reservedStock || 0) - item.quantity
          );

          await product.save({ session: session || undefined });
          console.log(`✅ Confirmed: ${item.quantity} units of ${variant.sku}`);
        }
      }
    }
  }

  private async releaseReservation(
    orderId: string,
    session?: mongoose.ClientSession
  ) {
    const order = await Order.findById(orderId).session(session || null);
    if (!order) return;

    for (const item of order.orderItemsSnapshot) {
      const product = await Product.findById(item.productId).session(
        session || null
      );
      if (product && item.variantId) {
        const variant = product.variants.find(
          (v: IVariant) => v._id?.toString() === item.variantId?.toString()
        );

        if (variant) {
          // Only reduce reserved stock (don't touch actual stock)
          variant.reservedStock = Math.max(
            0,
            (variant.reservedStock || 0) - item.quantity
          );

          await product.save({ session: session || undefined });
          console.log(`✅ Released: ${item.quantity} units of ${variant.sku}`);
        }
      }
    }
  }

  private calculateSecureOrderFees(
    orderValue: number,
    deliveryCharges: any,
    payment: PlaceOrderPayment // ✅ Using your existing type
  ) {
    const packagingFee = 29;

    // ✅ Changed to ₹15,000 for advance eligibility
    const isEligibleForAdvance = orderValue >= 15000;
    const isAdvancePayment = payment.isAdvance === true;

    if (isAdvancePayment && !isEligibleForAdvance) {
      throw new AppError(
        `Advance payment requires minimum order of ₹15,000. Current: ₹${orderValue}`,
        400
      );
    }

    const codHandlingFee =
      payment.method === "COD" && !isAdvancePayment ? 99 : 0;

    const advanceAmount = isAdvancePayment ? Math.round(orderValue * 0.1) : 0;
    const remainingAmount = isAdvancePayment
      ? orderValue + packagingFee + deliveryCharges.finalCharge - advanceAmount
      : 0;

    const finalPayableAmount = isAdvancePayment
      ? advanceAmount + packagingFee + deliveryCharges.finalCharge
      : orderValue +
        packagingFee +
        deliveryCharges.finalCharge +
        codHandlingFee;

    return {
      packagingFee,
      codHandlingFee,
      advanceAmount,
      remainingAmount,
      finalPayableAmount,
      isAdvancePayment,
      isEligibleForAdvance,
    };
  }

  async placeOrder(
    userId: string,
    orderData: PlaceOrderRequest,
    idempotencyKey?: string
  ) {
    // ✅ Check for existing order with same idempotencyKey
    if (idempotencyKey) {
      const existingOrder = await Order.findOne({
        user: userId,
        idempotencyKey,
      });

      if (existingOrder) {
        return existingOrder;
      }
    }

    const session = await mongoose.startSession();
    let createdOrder: any;

    try {
      await session.withTransaction(async () => {
        let { items, shippingAddress, payment, fromCart } = orderData;

        // If ordering from cart, fetch cart items
        if ((!items || items.length === 0) && fromCart) {
          const cart = await Cart.findOne({ user: userId }).session(session);
          if (!cart || cart.items.length === 0)
            throw new AppError("Cart is empty", 400);

          items = cart.items.map((item) => ({
            productId: item.product.toString(),
            variantId: item.variantId.toString(),
            quantity: item.quantity,
          }));
        }

        if (!items || items.length === 0)
          throw new AppError("No order items provided.", 400);

        // ✅ STEP 1: Validate delivery availability
        const deliveryCheck = await HybridDeliveryService.checkDeliverability(
          shippingAddress.pincode
        );

        if (!deliveryCheck.isServiceable) {
          throw new AppError(
            `Delivery not available for pincode ${shippingAddress.pincode}. ${deliveryCheck.message}`,
            400
          );
        }

        // ✅ STEP 2: Build order items and calculate weight
        const { orderItemsSnapshot, totalAmount, totalWeight } =
          await this.buildOrderItems(items, session);

        // ✅ STEP 3: Calculate delivery charges
        const deliveryCharges = await this.calculateDeliveryCharges(
          shippingAddress.pincode,
          totalWeight,
          totalAmount
        );

        // ✅ STEP 4: Calculate fees with advance payment logic
        const feeBreakdown = this.calculateSecureOrderFees(
          totalAmount,
          deliveryCharges,
          payment
        );

        // ✅ STEP 5: Enhanced payment processing
        let paymentStatus: "pending" | "paid" | "partial" = "pending";
        let paymentMethod: "COD" | "RAZORPAY" = payment.method as
          | "COD"
          | "RAZORPAY";
        let provider = payment.method === "COD" ? "CASH" : "RAZORPAY";

        // Check COD availability
        if (payment.method === "COD" && !deliveryCharges.codAvailable) {
          throw new AppError(
            "COD is not available for this delivery location. Please use online payment.",
            400
          );
        }

        // ✅ Validate advance payment constraints
        if (feeBreakdown.isAdvancePayment && payment.method === "COD") {
          throw new AppError(
            "Advance payment cannot be COD. Please use online payment.",
            400
          );
        }

        // Verify Razorpay payment
        if (payment.method === "RAZORPAY") {
          if (
            !payment.razorpayOrderId ||
            !payment.razorpayPaymentId ||
            !payment.razorpaySignature
          ) {
            throw new AppError("Missing Razorpay payment information", 400);
          }

          const { verified } =
            await paymentService.verifySignatureAndGetDetails({
              razorpay_order_id: payment.razorpayOrderId,
              razorpay_payment_id: payment.razorpayPaymentId,
              razorpay_signature: payment.razorpaySignature,
            });

          if (!verified)
            throw new AppError("Razorpay payment verification failed", 400);

          // ✅ Set payment status based on advance payment
          paymentStatus = feeBreakdown.isAdvancePayment ? "partial" : "paid";
        }

        const generatedOrderId = await generateStandardOrderId();

        // ✅ STEP 6: Create order with enhanced fee tracking
        const [newOrder] = await Order.create(
          [
            {
              user: userId,
              orderId: generatedOrderId,
              idempotencyKey,
              orderItemsSnapshot,

              // Complete shipping address (single source)
              shippingAddressSnapshot: shippingAddress,

              // ✅ Enhanced delivery snapshot with all fees
              deliverySnapshot: {
                zone: deliveryCharges.zone,
                deliveryCharge: deliveryCharges.finalCharge,
                originalDeliveryCharge: deliveryCharges.originalCharge,
                weightSurcharge: deliveryCharges.weightSurcharge,
                discount: deliveryCharges.discount,
                estimatedDays: deliveryCharges.estimatedDays,
                courierPartner: deliveryCharges.courierPartner,
                codAvailable: deliveryCharges.codAvailable,
                totalWeight: totalWeight,

                // ✅ New fee fields
                packagingFee: feeBreakdown.packagingFee,
                codHandlingFee: feeBreakdown.codHandlingFee,
                advancePaymentAmount: feeBreakdown.advanceAmount,
                remainingAmount: feeBreakdown.remainingAmount,
              },

              // ✅ Enhanced payment snapshot
              paymentSnapshot: {
                method: paymentMethod,
                status: paymentStatus,
                provider,

                // ✅ New advance payment fields
                isAdvancePayment: feeBreakdown.isAdvancePayment,
                advancePercentage: feeBreakdown.isAdvancePayment ? 10 : 0,
                advanceAmount: feeBreakdown.advanceAmount,
                remainingAmount: feeBreakdown.remainingAmount,

                razorpayOrderId: payment.razorpayOrderId || null,
                razorpayPaymentId: payment.razorpayPaymentId || null,
                razorpaySignature: payment.razorpaySignature || null,
              },

              // ✅ Top-level fee tracking fields
              packagingFee: feeBreakdown.packagingFee,
              codHandlingFee: feeBreakdown.codHandlingFee,
              isAdvancePayment: feeBreakdown.isAdvancePayment,
              advancePaymentAmount: feeBreakdown.advanceAmount,
              remainingAmount: feeBreakdown.remainingAmount,

              totalAmount: feeBreakdown.finalPayableAmount,
              status: OrderStatus.Pending,
            },
          ],
          { session }
        );

        createdOrder = newOrder;

        // ✅ STEP 7: Handle stock confirmation based on payment
        if (
          paymentMethod === "COD" ||
          paymentStatus === "paid" ||
          paymentStatus === "partial"
        ) {
          await this.confirmReservation(
            (newOrder._id as mongoose.Types.ObjectId).toString(),
            session
          );
          newOrder.status = OrderStatus.Confirmed;
          await newOrder.save({ session });

          console.log(
            `✅ Order ${newOrder.orderId} confirmed and stock decremented`
          );
        } else {
          console.log(
            `✅ Order ${newOrder.orderId} created with reserved stock`
          );
        }

        // ✅ STEP 8: Clear cart if order placed from cart
        if (fromCart) {
          await Cart.findOneAndUpdate(
            { user: userId },
            { items: [] },
            { session }
          );
        }
      });

      return createdOrder;
    } catch (error: any) {
      // Release stock reservation on error
      if (createdOrder && createdOrder._id) {
        try {
          await this.releaseReservation(createdOrder._id.toString());
          console.log(
            `⚠️ Released reserved stock for failed order ${createdOrder.orderId}`
          );
        } catch (releaseError) {
          console.error("Error releasing reservation:", releaseError);
        }
      }

      // Handle duplicate idempotency key
      if (error.code === 11000 && error.message.includes("idempotencyKey")) {
        const existingOrder = await Order.findOne({
          user: userId,
          idempotencyKey,
        });
        if (existingOrder) {
          return existingOrder;
        }
      }
      throw error;
    } finally {
      await session.endSession();
    }
  }

  async getMyOrders(userId: string) {
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .select("-__v");

    const orderIds = orders.map((order) => order.orderId);
    const activeReturns = await Return.find({
      orderId: { $in: orderIds },
      user: new Types.ObjectId(userId),
      status: { $nin: ["cancelled"] },
    }).select("orderId status returnId requestedAt");

    const returnStatusMap = new Map();
    activeReturns.forEach((returnDoc) => {
      returnStatusMap.set(returnDoc.orderId, {
        hasActiveReturn: true,
        returnStatus: returnDoc.status,
        returnId: returnDoc.returnId,
        returnRequestedAt: returnDoc.requestedAt,
      });
    });

    return orders.map((order) => ({
      orderId: order.orderId,
      placedAt: order.placedAt,
      totalAmount: order.totalAmount,
      status: order.status,
      hasActiveReturn: returnStatusMap.has(order.orderId),
      returnInfo: returnStatusMap.get(order.orderId) || null,

      // ✅ CLEAN: Combine delivery info from separate sources
      deliveryInfo: {
        // Address data from shipping snapshot
        pincode: order.shippingAddressSnapshot.pincode,
        city: order.shippingAddressSnapshot.city,

        // Delivery data from delivery snapshot
        zone: order.deliverySnapshot?.zone,
        estimatedDays: order.deliverySnapshot?.estimatedDays,
        deliveryCharge: order.deliverySnapshot?.deliveryCharge,
        courierPartner: order.deliverySnapshot?.courierPartner,
        trackingId: order.deliverySnapshot?.trackingId,
        totalWeight: order.deliverySnapshot?.totalWeight,
      },

      productPreview: {
        images: order.orderItemsSnapshot?.[0]?.image || null,
        name: order.orderItemsSnapshot[0]?.name || "Product",
        quantity: order.orderItemsSnapshot.reduce(
          (acc, item) => acc + item.quantity,
          0
        ),
      },

      shippingSummary: {
        name: order.shippingAddressSnapshot.fullName,
        city: order.shippingAddressSnapshot.city,
        state: order.shippingAddressSnapshot.state,
        pincode: order.shippingAddressSnapshot.pincode,
      },

      paymentStatus: order.paymentSnapshot?.status || "unpaid",
    }));
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await Order.findOne({ user: userId, _id: orderId });
    if (!order) throw new AppError("Order not found", 404);

    if (order.status === OrderStatus.Cancelled) {
      throw new AppError("Order is already cancelled", 400);
    }

    const now = new Date();
    const orderCreatedAt = order.placedAt;
    const hoursSinceOrder =
      (now.getTime() - orderCreatedAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceOrder > 12) {
      throw new AppError("Order cannot be cancelled after 12 hours", 400);
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        order.status = OrderStatus.Cancelled;
        await order.save({ session });

        // Release reserved stock
        await this.releaseReservation(orderId, session);
      });
    } finally {
      await session.endSession();
    }

    return {
      success: true,
      message: "Order cancelled successfully",
      orderId: order._id,
    };
  }

  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    trackingInfo?: {
      trackingId?: string;
      courierPartner?: string;
      estimatedDelivery?: Date;
    }
  ) {
    const order = await Order.findById(orderId);
    if (!order) throw new AppError("Order not found", 404);

    const currentStatus = order.status as OrderStatus;

    if (!this.allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new AppError(
        `Invalid transition from ${currentStatus} to ${newStatus}`,
        400
      );
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        order.status = newStatus;

        // ✅ Add delivery tracking info when shipped
        if (newStatus === OrderStatus.Shipped && trackingInfo) {
          if (order.deliverySnapshot) {
            order.deliverySnapshot.trackingId = trackingInfo.trackingId;
            if (trackingInfo.courierPartner) {
              order.deliverySnapshot.courierPartner =
                trackingInfo.courierPartner;
            }
            if (trackingInfo.estimatedDelivery) {
              order.deliverySnapshot.estimatedDelivery =
                trackingInfo.estimatedDelivery;
            }
          }
        }

        await order.save({ session });

        // Handle stock based on status change
        if (
          newStatus === OrderStatus.Confirmed &&
          order.paymentSnapshot.status === "paid"
        ) {
          await this.confirmReservation(orderId, session);
        } else if (
          newStatus === OrderStatus.Cancelled ||
          newStatus === OrderStatus.Failed
        ) {
          await this.releaseReservation(orderId, session);
        }
      });
    } finally {
      await session.endSession();
    }

    return order;
  }
  //for dispaly
  /**
   * ✅ SIMPLE: Only pricing calculation for frontend display
   */
  async calculateDisplayPricing(
    items: { productId: string; quantity: number; variantId?: string }[],
    pincode: string
  ) {
    // Validate pincode format
    if (!pincode || !/^\d{6}$/.test(pincode)) {
      throw new AppError("Valid 6-digit pincode is required", 400);
    }

    if (!items || items.length === 0) {
      throw new AppError("No items provided for pricing calculation", 400);
    }

    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new AppError(`Product not found: ${item.productId}`, 404);
      }

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

      const finalPrice =
        selectedVariant.hasDiscount && selectedVariant.discountedPrice > 0
          ? selectedVariant.discountedPrice
          : selectedVariant.price;

      subtotal += finalPrice * item.quantity;
    }

    const fixedWeight = 1;
    let deliveryCharges;
    let isServiceable = true;
    let deliveryMessage = "";

    try {
      deliveryCharges = await this.calculateDeliveryCharges(
        pincode,
        fixedWeight,
        subtotal
      );
    } catch (error) {
      console.log(
        `⚠️ Delivery unavailable for pincode ${pincode}:`,
      );

      // ✅ Use isServiceable to match your delivery types
      isServiceable = false;
      deliveryCharges = {
        finalCharge: 0,
        codAvailable: false,
        zone: "Not Available",
        estimatedDays: 0,
        courierPartner: "Not Available",
      };
    }

    const packagingFee = 29;
    const deliveryCharge = isServiceable ? deliveryCharges.finalCharge : 0;
    const codHandlingFee = 99;
    const isAdvanceEligible = isServiceable && subtotal >= 15000;

    let advanceAmount = 0;
    let remainingAmount = 0;

    if (isAdvanceEligible) {
      advanceAmount = Math.round(subtotal * 0.1);
      remainingAmount = subtotal - advanceAmount;
    }

    const result = {
      subtotal,
      packagingFee,
      deliveryCharge,
      codHandlingFee,
      checkoutTotal: subtotal + packagingFee + deliveryCharge,
      codTotal: subtotal + packagingFee + deliveryCharge + codHandlingFee,

      // ✅ Use isServiceable to match your delivery system
      isServiceable: isServiceable,

      advanceEligible: isAdvanceEligible,
      advanceAmount,
      remainingAmount,
      advancePercentage: isAdvanceEligible ? 10 : 0,

      deliveryInfo: {
        codAvailable: isServiceable ? deliveryCharges.codAvailable : false,
        zone: deliveryCharges.zone,
        estimatedDays: deliveryCharges.estimatedDays,
        courierPartner: deliveryCharges.courierPartner || "Not Available",
        isServiceable: isServiceable, // ✅ Add isServiceable here too
        message: isServiceable ? "Delivery available" : deliveryMessage,
      },
    };

    return result;
  }
}

export default OrderService;
