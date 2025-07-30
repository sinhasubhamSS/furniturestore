import Product from "../models/product.models";
import { Order } from "../models/order.models";
import { PlaceOrderRequest } from "../types/orderservicetypes";
import { Cart } from "../models/cart.model";
import { CartItem } from "../models/cartItems.model";
import { paymentService } from "./paymentService";
import { AppError } from "../utils/AppError";
// Optional: Error helper

class OrderService {
  // Helper to process product items
  private async buildOrderItems(
    items: { productId: string; quantity: number }[]
  ) {
    const orderItemsSnapshot = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product)
        throw new AppError(`Product not found: ${item.productId}`, 404);
      if (product.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for product: ${product.name}`,
          400
        );
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItemsSnapshot.push({
        productId: product._id,
        name: product.name,
        image: product.images?.[0] || "",
        quantity: item.quantity,
        price: product.price,
      });

      product.stock -= item.quantity;
      await product.save();
    }

    return { orderItemsSnapshot, totalAmount };
  }

  // Unified order placement method
  async placeOrder(userId: string, orderData: PlaceOrderRequest) {
    let { items, shippingAddress, payment, fromCart } = orderData;

    // If items not provided (optional fallback), get from cart
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

    // Snapshot, total calculation, stock check
    const { orderItemsSnapshot, totalAmount } = await this.buildOrderItems(
      items
    );

    // Payment verification (Razorpay / COD)
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

    // Create the order
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

    // (Optional) If the order was from cart, cleanup cart
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
}

export default OrderService;
