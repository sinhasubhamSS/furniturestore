// services/OrderService.ts
import Product, { IVariant } from "../models/product.models";
import { Order, OrderStatus } from "../models/order.models";
import { Return } from "../models/return.models";
import {
  PlaceOrderPayment,
  PlaceOrderRequest,
} from "../types/orderservicetypes";
import { Cart } from "../models/cart.model";
import { paymentService } from "./paymentService";
import { AppError } from "../utils/AppError";
import mongoose from "mongoose";
import { HybridDeliveryService } from "./hybrid-deliveryService";
import { DeliveryCalculator } from "../utils/DeliveryCalculator/DeliveryCalculator";

// utilities / constants
import { ValidationUtils } from "../utils/validators";
import { IDGenerator } from "../utils/IDGenerator";
import { StatusManager } from "../utils/statusManger";
import { PaginationService } from "./PaginationService";
import { BUSINESS_RULES } from "../constants/Bussiness";

/**
 * OrderService - updated to use new product model fields:
 * - listingPrice (marketing MRP)
 * - sellingPrice (final inclusive price)
 * - finalSellingPrice (input-only, derived then cleared)
 * - reservedStock handling
 *
 * Key price decision:
 * - finalPrice used for order = variant.sellingPrice (if present)
 * - If sellingPrice missing, fallback to discountedPrice (legacy) or price/listingPrice
 * - We compute and snapshot basePrice/gstAmount/listingPrice/sellingPrice/discountPercent
 */
class OrderService {
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
    [OrderStatus.Shipped]: [
      OrderStatus.OutForDelivery,
      OrderStatus.Delivered,
      OrderStatus.Failed,
    ],
    [OrderStatus.OutForDelivery]: [OrderStatus.Delivered, OrderStatus.Failed],
    [OrderStatus.Delivered]: [OrderStatus.Refunded],
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
    ValidationUtils.validateOrderItems(items);

    const orderItemsSnapshot: any[] = [];
    let totalAmount = 0;
    let totalWeight = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        throw new AppError(`Product not found: ${item.productId}`, 404);
      }

      // pick variant (by id if provided, else first)
      let selectedVariant: IVariant | undefined;
      if (item.variantId) {
        selectedVariant = product.variants.find(
          (v: any) => v._id?.toString() === item.variantId
        );
      } else {
        selectedVariant = product.variants[0] as any;
      }

      if (!selectedVariant) {
        throw new AppError(
          `Variant not found for product: ${product.name}`,
          400
        );
      }

      // available stock takes reservedStock into account
      const availableStock =
        (selectedVariant.stock || 0) - (selectedVariant.reservedStock || 0);

      if (availableStock < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${product.name} (${selectedVariant.color}, ${selectedVariant.size}). Available: ${availableStock}`,
          400
        );
      }

      // Determine final price customer will pay for this variant:
      // Prefer sellingPrice (new canonical), then legacy discountedPrice, then listingPrice/price.
      const finalPrice =
        typeof selectedVariant.sellingPrice === "number" &&
        selectedVariant.sellingPrice > 0
          ? selectedVariant.sellingPrice
          : typeof selectedVariant.discountedPrice === "number" &&
            selectedVariant.discountedPrice > 0
          ? selectedVariant.discountedPrice
          : typeof selectedVariant.price === "number" && selectedVariant.price > 0
          ? selectedVariant.price
          : typeof selectedVariant.listingPrice === "number" &&
            selectedVariant.listingPrice > 0
          ? selectedVariant.listingPrice
          : 0;

      // Choose listing/marketing MRP for UI
      const listingPrice =
        typeof selectedVariant.listingPrice === "number" &&
        selectedVariant.listingPrice > 0
          ? selectedVariant.listingPrice
          : typeof selectedVariant.price === "number"
          ? selectedVariant.price
          : finalPrice;

      const gstAmount = typeof selectedVariant.gstAmount === "number"
        ? selectedVariant.gstAmount
        : 0;

      const discountPercent =
        typeof selectedVariant.discountPercent === "number"
          ? selectedVariant.discountPercent
          : selectedVariant.hasDiscount && listingPrice > 0
          ? Math.round(((listingPrice - finalPrice) / listingPrice) * 100)
          : 0;

      const itemTotal = finalPrice * item.quantity;
      totalAmount += itemTotal;

      const productWeight =
        product.measurements?.weight ?? BUSINESS_RULES.DEFAULT_PRODUCT_WEIGHT;
      totalWeight += productWeight * item.quantity;

      orderItemsSnapshot.push({
        productId: product._id,
        variantId: selectedVariant._id,
        name: product.name,
        image: selectedVariant.images?.[0]?.url || "",
        quantity: item.quantity,
        price: finalPrice,
        listingPrice,
        sellingPrice: finalPrice,
        basePrice: selectedVariant.basePrice ?? 0,
        gstAmount,
        hasDiscount: !!selectedVariant.hasDiscount,
        discountPercent,
        color: selectedVariant.color,
        size: selectedVariant.size,
        sku: selectedVariant.sku,
        weight: productWeight,
      });

      // Reserve stock (increment reservedStock, don't touch stock yet)
      if (!selectedVariant.reservedStock) selectedVariant.reservedStock = 0;
      selectedVariant.reservedStock += item.quantity;

      // Persist product (with session) so reservation is stored atomically
      await product.save({ session });
    }

    return { orderItemsSnapshot, totalAmount, totalWeight };
  }

  private async fetchOrdersWithReturns(
    filter: any,
    page: number = 1,
    limit: number = 10,
    populateFields?: string
  ) {
    const { page: validPage, limit: validLimit } =
      ValidationUtils.validatePagination(page, limit);

    const result = await PaginationService.paginate(
      Order,
      filter,
      validPage,
      validLimit,
      {
        populate: populateFields || "",
        sort: { placedAt: -1 },
      }
    );

    const orderIds = result.data.map((order: any) => order.orderId);
    const activeReturns = await Return.find({
      orderId: { $in: orderIds },
      status: { $nin: ["processed", "rejected"] },
    }).select("orderId status returnId requestedAt");

    const returnMap = new Map();
    activeReturns.forEach((ret: any) => {
      returnMap.set(ret.orderId, {
        hasActiveReturn: true,
        returnStatus: ret.status,
        returnId: ret.returnId,
        returnRequestedAt: ret.requestedAt,
      });
    });

    const formattedOrders = result.data.map((order: any) => ({
      ...order,
      hasActiveReturn: returnMap.has(order.orderId),
      returnInfo: returnMap.get(order.orderId) || null,
    }));

    return {
      orders: formattedOrders,
      pagination: result.pagination,
    };
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
    // fetch order by DB _id (not orderId string)
    const order = await Order.findById(orderId).session(session || null);
    if (!order) return;

    for (const item of order.orderItemsSnapshot) {
      const product = await Product.findById(item.productId).session(
        session || null
      );
      if (product && item.variantId) {
        const variant = product.variants.find(
          (v: any) => v._id?.toString() === item.variantId?.toString()
        );

        if (variant) {
          // Deduct actual stock and reduce reservedStock accordingly
          variant.stock = Math.max(0, (variant.stock || 0) - item.quantity);
          variant.reservedStock = Math.max(
            0,
            (variant.reservedStock || 0) - item.quantity
          );

          await product.save({ session: session || undefined });
        }
      }
    }
  }

  private async releaseReservation(
    orderId: string,
    session?: mongoose.ClientSession
  ) {
    // fetch order by DB _id
    const order = await Order.findById(orderId).session(session || null);
    if (!order) return;

    for (const item of order.orderItemsSnapshot) {
      const product = await Product.findById(item.productId).session(
        session || null
      );
      if (product && item.variantId) {
        const variant = product.variants.find(
          (v: any) => v._id?.toString() === item.variantId?.toString()
        );

        if (variant) {
          variant.reservedStock = Math.max(
            0,
            (variant.reservedStock || 0) - item.quantity
          );

          await product.save({ session: session || undefined });
        }
      }
    }
  }

  private calculateSecureOrderFees(
    orderValue: number,
    deliveryCharges: any,
    payment: PlaceOrderPayment
  ) {
    const packagingFee = BUSINESS_RULES.PACKAGING_FEE;
    const isEligibleForAdvance =
      orderValue >= BUSINESS_RULES.ADVANCE_PAYMENT_THRESHOLD;
    const isAdvancePayment = payment.isAdvance === true;

    if (isAdvancePayment && !isEligibleForAdvance) {
      throw new AppError(
        `Advance payment requires minimum order of ₹${BUSINESS_RULES.ADVANCE_PAYMENT_THRESHOLD}. Current: ₹${orderValue}`,
        400
      );
    }

    const codHandlingFee =
      payment.method === "COD" && !isAdvancePayment
        ? BUSINESS_RULES.COD_HANDLING_FEE
        : 0;

    const advanceAmount = isAdvancePayment
      ? Math.round(orderValue * BUSINESS_RULES.ADVANCE_PAYMENT_PERCENTAGE)
      : 0;

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

        ValidationUtils.validatePincode(shippingAddress.pincode);

        if ((!items || items.length === 0) && fromCart) {
          const cart = await Cart.findOne({ user: userId }).session(session);
          if (!cart || cart.items.length === 0)
            throw new AppError("Cart is empty", 400);

          items = cart.items.map((item: any) => ({
            productId: item.product.toString(),
            variantId: item.variantId?.toString(),
            quantity: item.quantity,
          }));
        }

        if (!items || items.length === 0)
          throw new AppError("No order items provided.", 400);

        // STEP 1: Validate delivery availability
        const deliveryCheck = await HybridDeliveryService.checkDeliverability(
          shippingAddress.pincode
        );

        if (!deliveryCheck.isServiceable) {
          throw new AppError(
            `Delivery not available for pincode ${shippingAddress.pincode}. ${deliveryCheck.message}`,
            400
          );
        }

        // STEP 2: Build order items and calculate weight (reserves stock)
        const { orderItemsSnapshot, totalAmount, totalWeight } =
          await this.buildOrderItems(items, session);

        // STEP 3: Calculate delivery charges
        const deliveryCharges = await this.calculateDeliveryCharges(
          shippingAddress.pincode,
          totalWeight,
          totalAmount
        );

        // STEP 4: Calculate fees with advance payment logic
        const feeBreakdown = this.calculateSecureOrderFees(
          totalAmount,
          deliveryCharges,
          payment
        );

        // STEP 5: Enhanced payment processing
        let paymentStatus: "pending" | "paid" | "partial" = "pending";
        let paymentMethod: "COD" | "RAZORPAY" = payment.method as
          | "COD"
          | "RAZORPAY";
        let provider = payment.method === "COD" ? "CASH" : "RAZORPAY";

        if (payment.method === "COD" && !deliveryCharges.codAvailable) {
          throw new AppError(
            "COD is not available for this delivery location. Please use online payment.",
            400
          );
        }

        if (feeBreakdown.isAdvancePayment && payment.method === "COD") {
          throw new AppError(
            "Advance payment cannot be COD. Please use online payment.",
            400
          );
        }

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

          paymentStatus = feeBreakdown.isAdvancePayment ? "partial" : "paid";
        }

        const generatedOrderId = await IDGenerator.generateOrderId(Order);

        // STEP 6: Create order document (store detailed snapshots)
        const [newOrder] = await Order.create(
          [
            {
              user: userId,
              orderId: generatedOrderId,
              idempotencyKey,
              orderItemsSnapshot,

              shippingAddressSnapshot: shippingAddress,

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
                packagingFee: feeBreakdown.packagingFee,
                codHandlingFee: feeBreakdown.codHandlingFee,
                advancePaymentAmount: feeBreakdown.advanceAmount,
                remainingAmount: feeBreakdown.remainingAmount,
              },

              paymentSnapshot: {
                method: paymentMethod,
                status: paymentStatus,
                provider,
                isAdvancePayment: feeBreakdown.isAdvancePayment,
                advancePercentage: feeBreakdown.isAdvancePayment
                  ? BUSINESS_RULES.ADVANCE_PAYMENT_PERCENTAGE * 100
                  : 0,
                advanceAmount: feeBreakdown.advanceAmount,
                remainingAmount: feeBreakdown.remainingAmount,
                razorpayOrderId: payment.razorpayOrderId || null,
                razorpayPaymentId: payment.razorpayPaymentId || null,
                razorpaySignature: payment.razorpaySignature || null,
              },

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

        // STEP 7: Confirm reservation when payment conditions are met
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
        } else {
          // leave as Pending with reservedStock until payment completes
        }

        // STEP 8: Clear cart if order placed from cart
        if (fromCart) {
          await Cart.findOneAndUpdate(
            { user: userId },
            {
              $set: {
                items: [],
                totalItems: 0,
                cartSubtotal: 0,
                cartGST: 0,
                cartTotal: 0,
              },
            },
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

  async getMyOrders(userId: string, page: number = 1, limit: number = 10) {
    const filter = { user: userId };
    const result = await this.fetchOrdersWithReturns(filter, page, limit);

    const userFormattedOrders = result.orders.map((order: any) => ({
      orderId: order.orderId,
      placedAt: order.placedAt,
      totalAmount: order.totalAmount,
      status: order.status,
      hasActiveReturn: order.hasActiveReturn,
      returnInfo: order.returnInfo,

      deliveryInfo: {
        pincode: order.shippingAddressSnapshot.pincode,
        city: order.shippingAddressSnapshot.city,
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
          (acc: number, item: any) => acc + item.quantity,
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

    return {
      orders: userFormattedOrders,
      pagination: result.pagination,
    };
  }

  async getAllOrdersAdmin(
    page: number = 1,
    limit: number = 20,
    status?: string,
    startDate?: string,
    endDate?: string,
    search?: string
  ) {
    const filter: any = {};

    if (status && status !== "all") {
      filter.status = status;
    }

    if (startDate && endDate) {
      filter.placedAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (search) {
      filter.$or = [
        { orderId: { $regex: search, $options: "i" } },
        {
          "shippingAddressSnapshot.fullName": { $regex: search, $options: "i" },
        },
        { "shippingAddressSnapshot.mobile": { $regex: search, $options: "i" } },
      ];
    }

    return await this.fetchOrdersWithReturns(filter, page, limit, "user");
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await Order.findOne({
      user: userId,
      orderId: orderId,
    });

    if (!order) throw new AppError("Order not found", 404);

    if (order.status === OrderStatus.Cancelled) {
      throw new AppError("Order is already cancelled", 400);
    }

    const now = new Date();
    const orderCreatedAt = order.placedAt;
    const hoursSinceOrder =
      (now.getTime() - orderCreatedAt.getTime()) / (1000 * 60 * 60);

    if (hoursSinceOrder > BUSINESS_RULES.ORDER_CANCELLATION_WINDOW_HOURS) {
      throw new AppError(
        `Order cannot be cancelled after ${BUSINESS_RULES.ORDER_CANCELLATION_WINDOW_HOURS} hours`,
        400
      );
    }

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        order.status = OrderStatus.Cancelled;
        await order.save({ session });

        // release using DB _id
        await this.releaseReservation((order as any)._id.toString(), session);
      });
    } finally {
      await session.endSession();
    }

    return {
      success: true,
      message: "Order cancelled successfully",
      orderId: order.orderId,
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

    StatusManager.validateTransition(
      currentStatus,
      newStatus,
      this.allowedTransitions,
      "Order"
    );

    const session = await mongoose.startSession();
    try {
      await session.withTransaction(async () => {
        order.status = newStatus;

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

  async calculateDisplayPricing(
    items: { productId: string; quantity: number; variantId?: string }[],
    pincode: string
  ) {
    ValidationUtils.validatePincode(pincode);
    ValidationUtils.validateOrderItems(items);

    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new AppError(`Product not found: ${item.productId}`, 404);
      }

      let selectedVariant;
      if (item.variantId) {
        selectedVariant = product.variants.find(
          (v: any) => v._id?.toString() === item.variantId
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
        typeof selectedVariant.sellingPrice === "number" &&
        selectedVariant.sellingPrice > 0
          ? selectedVariant.sellingPrice
          : typeof selectedVariant.discountedPrice === "number" &&
            selectedVariant.discountedPrice > 0
          ? selectedVariant.discountedPrice
          : typeof selectedVariant.price === "number" && selectedVariant.price > 0
          ? selectedVariant.price
          : typeof selectedVariant.listingPrice === "number" &&
            selectedVariant.listingPrice > 0
          ? selectedVariant.listingPrice
          : 0;

      subtotal += finalPrice * item.quantity;
    }

    const fixedWeight = BUSINESS_RULES.DEFAULT_PRODUCT_WEIGHT;
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
      isServiceable = false;
      deliveryCharges = {
        finalCharge: 0,
        codAvailable: false,
        zone: "Not Available",
        estimatedDays: 0,
        courierPartner: "Not Available",
      };
    }

    const packagingFee = BUSINESS_RULES.PACKAGING_FEE;
    const deliveryCharge = isServiceable ? deliveryCharges.finalCharge : 0;
    const codHandlingFee = BUSINESS_RULES.COD_HANDLING_FEE;
    const isAdvanceEligible =
      isServiceable && subtotal >= BUSINESS_RULES.ADVANCE_PAYMENT_THRESHOLD;

    let advanceAmount = 0;
    let remainingAmount = 0;

    if (isAdvanceEligible) {
      advanceAmount = Math.round(
        subtotal * BUSINESS_RULES.ADVANCE_PAYMENT_PERCENTAGE
      );
      remainingAmount = subtotal - advanceAmount;
    }

    const result = {
      subtotal,
      packagingFee,
      deliveryCharge,
      codHandlingFee,
      checkoutTotal: subtotal + packagingFee + deliveryCharge,
      codTotal: subtotal + packagingFee + deliveryCharge + codHandlingFee,

      isServiceable: isServiceable,

      advanceEligible: isAdvanceEligible,
      advanceAmount,
      remainingAmount,
      advancePercentage: isAdvanceEligible
        ? BUSINESS_RULES.ADVANCE_PAYMENT_PERCENTAGE * 100
        : 0,

      deliveryInfo: {
        codAvailable: isServiceable ? deliveryCharges.codAvailable : false,
        zone: deliveryCharges.zone,
        estimatedDays: deliveryCharges.estimatedDays,
        courierPartner: deliveryCharges.courierPartner || "Not Available",
        isServiceable: isServiceable,
        message: isServiceable ? "Delivery available" : deliveryMessage,
      },
    };

    return result;
  }
}

export default OrderService;
