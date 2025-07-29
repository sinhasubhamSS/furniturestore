import Product from "../models/product.models";
import { Order } from "../models/order.models";
import { PlaceOrderRequest } from "../types/orderservicetypes";
import { Cart } from "../models/cart.model";
import { CartItem } from "../models/cartItems.model";
import { paymentService } from "./paymentService";

class OrderService {
  // 🔁 Helper to process product items
  private async buildOrderItems(
    items: { productId: string; quantity: number }[]
  ) {
    const orderItemsSnapshot = [];
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) throw new Error(`Product not found: ${item.productId}`);
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for product: ${product.name}`);
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

  // ✅ Place Order from Product Page
  async placeOrderFromProductPage(
    userId: string,
    orderData: PlaceOrderRequest
  ) {
    const { items, shippingAddress, payment } = orderData;

    const { orderItemsSnapshot, totalAmount } = await this.buildOrderItems(
      items
    );

    // 🧾 Payment verification (if Razorpay)
    let paymentStatus: "pending" | "paid" = "pending";
    let paymentMethod: "COD" | "RAZORPAY" = payment.method as
      | "COD"
      | "RAZORPAY";
    let provider = payment.method === "COD" ? "CASH" : "RAZORPAY";

    if (payment.method === "RAZORPAY") {
      const { verified, method } =
        await paymentService.verifySignatureAndGetDetails({
          razorpay_order_id: payment.razorpayOrderId!,
          razorpay_payment_id: payment.razorpayPaymentId!,
          razorpay_signature: payment.razorpaySignature!,
        });

      if (!verified) throw new Error("❌ Razorpay payment verification failed");

      paymentStatus = "paid";
      paymentMethod = "RAZORPAY";
    }

    // 🛒 Create Order
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

    console.log("✅ New Order Created");
    return newOrder;
  }

  // ✅ Place Order from Cart
  // ✅ Place Order from Cart (updated with payment verification)
  async placeOrderFromCart(userId: string, orderData: PlaceOrderRequest) {
    const { shippingAddress, payment } = orderData;

    // Fetch user's cart
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      throw new Error("🛒 Cart is empty");
    }

    // Populate cart items with product info
    const cartItems = await CartItem.find({
      _id: { $in: cart.items },
    }).populate("product");

    // Map cartItems to order items structure
    const items = cartItems.map((item: any) => ({
      productId: item.product._id,
      quantity: item.quantity,
    }));

    // Build order items snapshot and compute total amount
    const { orderItemsSnapshot, totalAmount } = await this.buildOrderItems(
      items
    );

    // Payment verification logic
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
        throw new Error("Missing Razorpay payment information");
      }

      const { verified, method } =
        await paymentService.verifySignatureAndGetDetails({
          razorpay_order_id: payment.razorpayOrderId,
          razorpay_payment_id: payment.razorpayPaymentId,
          razorpay_signature: payment.razorpaySignature,
        });

      if (!verified) throw new Error("❌ Razorpay payment verification failed");

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

    // Cleanup cart (remove all items)
    await CartItem.deleteMany({ _id: { $in: cart.items } });
    cart.items = [];
    await cart.save();

    return newOrder;
  }
}

export default OrderService;
