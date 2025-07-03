import Product from "../models/product.models";
import { Order } from "../models/order.models";
import { PlaceOrderRequest } from "../types/orderservicetypes";
import { Cart } from "../models/cart.model";
import { CartItem } from "../models/cartItems.model";

class OrderService {
  async placeOrderFromProductPage(
    userId: string,
    orderData: PlaceOrderRequest
  ) {
    const { items, shippingAddress, payment } = orderData;

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

    const newOrder = await Order.create({
      user: userId,
      orderItemsSnapshot,
      shippingAddressSnapshot: shippingAddress,
      paymentSnapshot: {
        method: payment.method,
        status: "pending",
        provider: payment.method === "COD" ? "CASH" : "RAZORPAY",
        razorpayOrderId: payment.razorpayOrderId || null,
      },
      totalAmount,
      status: "pending",
    });

    return newOrder;
  }
  async placeOrderFromCart(userId:string, orderData: PlaceOrderRequest) {
    const { shippingAddress, payment } = orderData;

    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      throw new Error("Cart is empty");
    }

    const cartItems = await CartItem.find({
      _id: { $in: cart.items },
    }).populate("product");

    const orderItemsSnapshot = [];
    let totalAmount = 0;

    for (const item of cartItems) {
      const product: any = item.product;
      if (!product)
        throw new Error(`Product not found for cart item: ${item._id}`);

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

    const newOrder = await Order.create({
      user: userId,
      orderItemsSnapshot,
      shippingAddressSnapshot: shippingAddress,
      paymentSnapshot: {
        method: payment.method,
        status: "pending",
        provider: payment.method === "COD" ? "CASH" : "RAZORPAY",
        razorpayOrderId: payment.razorpayOrderId || null,
      },
      totalAmount,
      status: "pending",
    });

    // Cleanup: Delete cartItems and clear cart
    await CartItem.deleteMany({ _id: { $in: cart.items } });
    cart.items = [];
    await cart.save();

    return newOrder;
  }
}

export default OrderService;
