import Product from "../models/product.models";
import { Order } from "../models/order.models";
import { PlaceOrderRequest } from "../types/orderservicetypes";

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
        ...payment,
        status: "pending",
      },
      totalAmount,
      status: "pending",
    });

    return newOrder;
  }
}

export default OrderService;
