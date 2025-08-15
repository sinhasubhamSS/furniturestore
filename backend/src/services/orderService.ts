import Product from "../models/product.models";
import { Order, OrderStatus } from "../models/order.models";
import { PlaceOrderRequest } from "../types/orderservicetypes";
import { Cart } from "../models/cart.model";
import { CartItem } from "../models/cartItems.model";
import { paymentService } from "./paymentService";
import { AppError } from "../utils/AppError";

class OrderService {
  // Helper to process product items
  private async buildOrderItems(
    items: { productId: string; quantity: number; variantId?: string }[]
  ) {
    const orderItemsSnapshot = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new AppError(`Product not found: ${item.productId}`, 404);
      }

      // ✅ FIXED: Select variant logic with proper typing
      let selectedVariant;
      if (item.variantId) {
        selectedVariant = product.variants.find(
          (v) => v._id?.toString() === item.variantId
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
      if (selectedVariant.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for ${product.name} (${selectedVariant.color}, ${selectedVariant.size})`,
          400
        );
      }

      // Use variant price
      const itemTotal = selectedVariant.price * item.quantity;
      totalAmount += itemTotal;

      orderItemsSnapshot.push({
        productId: product._id,
        name: product.name,
        image: selectedVariant.images?.[0]?.url || "",
        quantity: item.quantity,
        price: selectedVariant.price,
      });

      // ✅ FIXED: Update variant stock only
      selectedVariant.stock -= item.quantity;

      // ✅ REMOVED: Don't update product.stock since it's not in schema anymore
      // Virtual field will calculate totalStock automatically

      await product.save();
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
  async placeOrder(userId: string, orderData: PlaceOrderRequest) {
    let { items, shippingAddress, payment, fromCart } = orderData;

    if ((!items || items.length === 0) && fromCart) {
      const cart = await Cart.findOne({ user: userId });
      if (!cart || cart.items.length === 0)
        throw new AppError("Cart is empty", 400);
      const cartItems = await CartItem.find({
        _id: { $in: cart.items },
      }).populate("product");
      items = cartItems.map((item: any) => ({
        productId: item.product._id,
        quantity: item.quantity,
      }));
    }

    if (!items || items.length === 0)
      throw new AppError("No order items provided.", 400);

    const { orderItemsSnapshot, totalAmount } = await this.buildOrderItems(
      items
    );

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

      const { verified } = await paymentService.verifySignatureAndGetDetails({
        razorpay_order_id: payment.razorpayOrderId,
        razorpay_payment_id: payment.razorpayPaymentId,
        razorpay_signature: payment.razorpaySignature,
      });

      if (!verified)
        throw new AppError("Razorpay payment verification failed", 400);

      paymentStatus = "paid";
      paymentMethod = "RAZORPAY";
    }

    const newOrder = await Order.create({
      user: userId,
      orderItemsSnapshot,
      shippingAddressSnapshot: shippingAddress,
      paymentSnapshot: {
        method: paymentMethod,
        status: paymentStatus,
        provider,
        razorpayOrderId: payment.razorpayOrderId || null,
        razorpayPaymentId: payment.razorpayPaymentId || null,
      },
      totalAmount,
      status: "pending",
    });

    if (fromCart) {
      const cart = await Cart.findOne({ user: userId });
      if (cart && cart.items.length > 0) {
        await CartItem.deleteMany({ _id: { $in: cart.items } });
        cart.items = [];
        await cart.save();
      }
    }

    return newOrder;
  }

  async handleRazorpayWebhook(data: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) {
    const { razorpayOrderId, razorpayPaymentId } = data;

    // Order find karo razorpay order ID se
    const order = await Order.findOne({
      "paymentSnapshot.razorpayOrderId": razorpayOrderId,
    });

    if (!order) {
      throw new AppError("Order not found for given Razorpay Order ID", 404);
    }

    // Check if order already confirmed to avoid duplicate processing
    if (order.status === OrderStatus.Confirmed) {
      console.log(`Order ${order._id} already confirmed`);
      return order;
    }

    // Update payment details and status
    order.paymentSnapshot.status = "paid";
    order.paymentSnapshot.razorpayPaymentId = razorpayPaymentId;
    order.status = OrderStatus.Confirmed;

    await order.save();

    console.log(`✅ Order ${order._id} confirmed via webhook`);
    return order;
  }

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
    // 1. Find order with userId and orderId
    const order = await Order.findOne({ user: userId, _id: orderId }); // Fixed underscore
    if (!order) throw new AppError("Order not found", 404);

    // 2. Check if order is already cancelled
    if (order.status === "cancelled") {
      throw new AppError("Order is already cancelled", 400);
    }

    // 3. Check if cancellation is within allowed time window (12 hours)
    const now = new Date();
    const orderCreatedAt = order.placedAt;
    const hoursSinceOrder =
      (now.getTime() - orderCreatedAt.getTime()) / (1000 * 60 * 60); // Fixed multiplication

    if (hoursSinceOrder > 12) {
      throw new AppError("Order cannot be cancelled after 12 hours", 400);
    }

    // 4. Update order status to 'cancelled'
    order.status = OrderStatus.Cancelled;
    await order.save();

    // 5. ✅ FIXED: Restore variant stock (not product stock)
    for (const item of order.orderItemsSnapshot) {
      const product = await Product.findById(item.productId);
      if (product && item.variantId) {
        // Find the specific variant that was ordered
        const variant = product.variants.find(
          (v) => v._id?.toString() === item.variantId?.toString()
        );

        if (variant) {
          // Restore variant stock
          variant.stock += item.quantity;
          await product.save();

          console.log(
            `✅ Restored ${item.quantity} units to variant ${variant.sku}`
          );
        } else {
          console.warn(`⚠️ Variant not found for item: ${item.name}`);
        }
      } else if (product) {
        // ✅ Fallback: If no variantId stored in order, restore to first variant
        const firstVariant = product.variants[0];
        if (firstVariant) {
          firstVariant.stock += item.quantity;
          await product.save();

          console.log(
            `✅ Restored ${item.quantity} units to first variant (fallback)`
          );
        }
      }
    }

    // 6. Return success response
    return {
      success: true,
      message: "Order cancelled successfully",
      orderId: order._id, // Fixed underscore
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

    order.status = newStatus;
    await order.save();

    return order;
  }
}

export default OrderService;
