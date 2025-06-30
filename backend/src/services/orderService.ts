import { Types } from "mongoose";
import Product from "../models/product.models";
import { Order } from "../models/order.models";
import { PlaceOrderRequest, PlaceOrderItem } from "../types/orderservicetypes";
import { OrderStatus } from "../models/order.models";

export const createOrderFromProductPage = async (
  userId: Types.ObjectId,
  orderData: PlaceOrderRequest
) => {
  const { items, shippingAddress, payment } = orderData;

  // Step 1: Get all product IDs
  const productIds = items.map((item) => item.productId);
  const products = await Product.find({ _id: { $in: productIds } });

  // Step 2: Create snapshot of each order item
  const orderItemsSnapshot = items.map((item) => {
    const product = products.find((p) => p._id.toString() === item.productId);

    if (!product) {
      throw new Error("Product not found: " + item.productId);
    }

    return {
      productId: product._id,
      name: product.name,
      image: product.image,
      quantity: item.quantity,
      price: product.price,
    };
  });

  // Step 3: Calculate total
  const totalAmount = orderItemsSnapshot.reduce(
    (sum, item) => sum + item.quantity * item.price,
    0
  );

  // Step 4: Create the order
  const newOrder = new Order({
    user: userId,
    orderItemsSnapshot,
    shippingAddressSnapshot: shippingAddress,
    paymentSnapshot: {
      ...payment,
      status: "pending",
    },
    status: OrderStatus.Pending,
    totalAmount,
  });

  await newOrder.save();

  return {
    message: "Order placed successfully",
    orderId: newOrder._id,
  };
};
