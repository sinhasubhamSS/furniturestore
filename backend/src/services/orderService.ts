import Product, { IVariant } from "../models/product.models";
import {
  generateStandardOrderId,
  Order,
  OrderStatus,
} from "../models/order.models";
import { PlaceOrderRequest } from "../types/orderservicetypes";
import { Cart } from "../models/cart.model";
import { paymentService } from "./paymentService";
import { AppError } from "../utils/AppError";
import mongoose from "mongoose";
class OrderService {
  // Helper to process product items
  private async buildOrderItems(
    items: { productId: string; quantity: number; variantId?: string }[],
    session: mongoose.ClientSession
  ) {
    const orderItemsSnapshot = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId).session(session);
      if (!product) {
        throw new AppError(`Product not found: ${item.productId}`, 404);
      }

      // ✅ FIXED: Select variant logic with proper typing
      let selectedVariant;
      if (item.variantId) {
        selectedVariant = product.variants.find(
          (v: IVariant) => v._id?.toString() === item.variantId
        );
      } else {
        selectedVariant = product.variants[0]; // Use first variant as default
      }

      if (!selectedVariant) {
        throw new AppError(
          `Variant not found for product: ${product.name}`,
          400
        );
      }

      // Check variant stock
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
          ? selectedVariant.discountedPrice // discounted price (includes GST)
          : selectedVariant.price;
      // Use variant price
      const itemTotal = finalPrice * item.quantity;
      totalAmount += itemTotal;

      orderItemsSnapshot.push({
        productId: product._id,
        variantId: selectedVariant._id,
        name: product.name,
        image: selectedVariant.images?.[0]?.url || "",
        quantity: item.quantity,
        price: finalPrice, // ✅ Only final price
        hasDiscount: selectedVariant.hasDiscount,
        discountPercent: selectedVariant.discountPercent || 0,
        color: selectedVariant.color,
        size: selectedVariant.size,
        sku: selectedVariant.sku,
      });
      if (!selectedVariant.reservedStock) {
        selectedVariant.reservedStock = 0; // Initialize if undefined
      }
      selectedVariant.reservedStock += item.quantity;
      await product.save({ session });
    }

    return { orderItemsSnapshot, totalAmount };
  }

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

  // Place a new order
  // async placeOrder(userId: string, orderData: PlaceOrderRequest) {
  //   let { items, shippingAddress, payment, fromCart } = orderData;

  //   // Agar items nahi diye aur fromCart true hai to cart se items le lo
  //   if ((!items || items.length === 0) && fromCart) {
  //     const cart = await Cart.findOne({ user: userId });
  //     if (!cart || cart.items.length === 0)
  //       throw new AppError("Cart is empty", 400);

  //     const cartItems = await CartItem.find({
  //       _id: { $in: cart.items },
  //     }).populate("product");

  //     items = cartItems.map((item: any) => ({
  //       productId: item.product._id,
  //       quantity: item.quantity,
  //     }));
  //   }

  //   if (!items || items.length === 0)
  //     throw new AppError("No order items provided.", 400);

  //   // Product stock check aur order snapshot create karo
  //   const { orderItemsSnapshot, totalAmount } = await this.buildOrderItems(
  //     items
  //   );

  //   // Payment method and provider set karo
  //   let paymentMethod: "COD" | "RAZORPAY" = payment.method as
  //     | "COD"
  //     | "RAZORPAY";
  //   let provider = payment.method === "COD" ? "CASH" : "RAZORPAY";

  //   // Payment status yahan hum pending set karenge, verification webhook pe hoga
  //   const paymentStatus = "pending";
  //   // payment status for webhook to handle

  //   const orderStatus = paymentMethod === "COD" ? "confirmed" : "pending";

  //   // Order create karo without payment verification
  //   const newOrder = await Order.create({
  //     user: userId,
  //     orderItemsSnapshot,
  //     shippingAddressSnapshot: shippingAddress,
  //     paymentSnapshot: {
  //       method: paymentMethod,
  //       status: paymentStatus,
  //       provider,
  //       razorpayOrderId: payment.razorpayOrderId || null, // rakho taaki webhook mein match ho sake
  //       razorpayPaymentId: null, // abhi null because payment verify nahi kiya
  //     },
  //     totalAmount,
  //     status: orderStatus, // pending by default
  //   });

  //   // Agar order cart se hai to cart clear kar do
  //   if (fromCart) {
  //     const cart = await Cart.findOne({ user: userId });
  //     if (cart && cart.items.length > 0) {
  //       await CartItem.deleteMany({ _id: { $in: cart.items } });
  //       cart.items = [];
  //       await cart.save();
  //     }
  //   }

  //   return newOrder;
  // }

  //remove when webhook implemmeted and uncomment above one after hosting implement webhook

  // ✅ 1. Payment successful होने पर stock confirm करने के लिए
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
          // Reserved stock को actual stock से minus करो
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

  // ✅ 2. Order cancel/fail होने पर reserved stock release करने के लिए
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
          // Reserved stock को release करो (actual stock unchanged)
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

  async placeOrder(
    userId: string,
    orderData: PlaceOrderRequest,
    idempotencyKey?: string
  ) {
    // ✅ CONCEPT 1: Check for existing order with same idempotencyKey
    if (idempotencyKey) {
      const existingOrder = await Order.findOne({
        user: userId,
        idempotencyKey,
      });

      if (existingOrder) {
        return existingOrder; // Return existing order
      }
    }

    const session = await mongoose.startSession(); // Create DB session
    let createdOrder: any; // ✅ Move outside try block for catch access

    try {
      await session.withTransaction(async () => {
        let { items, shippingAddress, payment, fromCart } = orderData;

        // If fromCart, fetch items from cart inside transaction (with session)
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

        // Build items snapshot (RESERVES stock, doesn't decrement yet)
        const { orderItemsSnapshot, totalAmount } = await this.buildOrderItems(
          items,
          session
        );

        // Payment verification as before
        let paymentStatus: "pending" | "paid" = "pending";
        let paymentMethod: "COD" | "RAZORPAY" = payment.method as
          | "COD"
          | "RAZORPAY";
        let provider = payment.method === "COD" ? "CASH" : "RAZORPAY";

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

          paymentStatus = "paid";
        }

        const generatedOrderId = await generateStandardOrderId();

        // ✅ Create order
        const [newOrder] = await Order.create(
          [
            {
              user: userId,
              orderId: generatedOrderId,
              idempotencyKey, // ✅ Add idempotencyKey
              orderItemsSnapshot,
              shippingAddressSnapshot: shippingAddress,
              paymentSnapshot: {
                method: paymentMethod,
                status: paymentStatus,
                provider,
                razorpayOrderId: payment.razorpayOrderId || null,
                razorpayPaymentId: payment.razorpayPaymentId || null,
                razorpaySignature: payment.razorpaySignature || null, // ✅ Add signature
              },
              totalAmount,
              status: OrderStatus.Pending, // ✅ Use enum instead of string
            },
          ],
          { session }
        );
        createdOrder = newOrder;

        // ✅ Handle reservation based on payment status
        if (paymentMethod === "COD" || paymentStatus === "paid") {
          // COD या successful Razorpay के लिए immediately confirm करो
          await this.confirmReservation(
            (newOrder._id as mongoose.Types.ObjectId).toString(),
            session
          );
          newOrder.status = OrderStatus.Confirmed; // ✅ Use enum
          await newOrder.save({ session });

          console.log(
            `✅ Order ${newOrder.orderId} confirmed and stock decremented`
          );
        } else {
          // Pending payments के लिए सिर्फ reserve रखो
          console.log(
            `✅ Order ${newOrder.orderId} created with reserved stock`
          );
        }

        // Clear user's cart if needed (also with session!)
        if (fromCart) {
          await Cart.findOneAndUpdate(
            { user: userId },
            { items: [] },
            { session }
          );
        }
      });

      // Transaction auto-commits if all succeeded
      return createdOrder;
    } catch (error: any) {
      // ✅ Error handling with stock release
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

      // ✅ Handle race condition for idempotencyKey
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
      // Ensure session is closed even if error thrown
      await session.endSession();
    }
  }

  // async handleRazorpayWebhook(data: {
  //   razorpayOrderId: string;
  //   razorpayPaymentId: string;
  //   razorpaySignature: string;
  // }) {
  //   const { razorpayOrderId, razorpayPaymentId } = data;

  //   // Order find karo razorpay order ID se
  //   const order = await Order.findOne({
  //     "paymentSnapshot.razorpayOrderId": razorpayOrderId,
  //   });

  //   if (!order) {
  //     throw new AppError("Order not found for given Razorpay Order ID", 404);
  //   }

  //   // Check if order already confirmed to avoid duplicate processing
  //   if (order.status === OrderStatus.Confirmed) {
  //     console.log(`Order ${order._id} already confirmed`);
  //     return order;
  //   }

  //   // Update payment details and status
  //   order.paymentSnapshot.status = "paid";
  //   order.paymentSnapshot.razorpayPaymentId = razorpayPaymentId;
  //   order.status = OrderStatus.Confirmed;

  //   await order.save();

  //   console.log(`✅ Order ${order._id} confirmed via webhook`);
  //   return order;
  // }

  // ✅ Get all orders for user with simplified structure
  async getMyOrders(userId: string) {
    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .select("-__v");

    return orders.map((order) => ({
      _id: order._id, // Order ID
      placedAt: order.placedAt, // Date of placing
      totalAmount: order.totalAmount, // Final amount
      status: order.status, // Order status like 'shipped', 'delivered'

      // Thumbnail details: show only 1st product
      productPreview: {
        images: order.orderItemsSnapshot?.[0]?.image || null,

        name: order.orderItemsSnapshot[0]?.name || "Product",
        quantity: order.orderItemsSnapshot.reduce(
          (acc, item) => acc + item.quantity,
          0
        ), // total qty
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

        // ✅ NEW: Use releaseReservation instead of manual stock restoration
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

  async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
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
        await order.save({ session });

        // ✅ NEW: Handle stock based on status change
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
}

export default OrderService;
