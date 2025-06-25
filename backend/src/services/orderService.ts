import { Types } from "mongoose";
import { OrderItem } from "../models/orderItems.models";
import { Order } from "../models/order.models";

interface ShippingAddress {
  address: string;
  Landmark: string;
  city: string;
  pincode: string;
  state: string;
  country: string;
}
interface OrderItemInput {
  product: string;
  quantity: number;
  priceAtPurchase: number;
  title: string;
  image: string;
}

class OrderService {
  async createFromProduct(
    userId: string,
    productDetails: OrderItemInput,
    shippingAddress: ShippingAddress,
    paymentMethod: string
  ) {
    const orderId = new Types.ObjectId();
    const orderItem = await OrderItem.create({
      ...productDetails,
      user: userId,
      order: orderId,
    });
    const order = await Order.create({
      _id: orderId,
      user: userId,
      orderItems: [orderItem._id],
      shippingAddress,
      paymentMethod,
      paymentStatus: "pending",
      orderStatus: "Processing",
      totalAmount: productDetails.priceAtPurchase * productDetails.quantity,
    });
    return order;
  }
}
export const orderService = new OrderService();

//  async createFromSelectedCartItems(userId: string, selectedCartItemIds: string[], shippingAddress: ShippingAddress, paymentMethod: string) {
//     const cartItems = await CartItem.find({
//       _id: { $in: selectedCartItemIds },
//       user: userId,
//     }).populate("product");

//     const orderId = new Types.ObjectId();

//     const orderItems = await OrderItem.insertMany(
//       cartItems.map((item) => ({
//         order: orderId,
//         product: item.product._id,
//         quantity: item.quantity,
//         priceAtPurchase: item.product.price,
//         title: item.product.title,
//         image: item.product.image,
//       }))
//     );

//     const totalAmount = orderItems.reduce(
//       (acc, item) => acc + item.priceAtPurchase * item.quantity,
//       0
//     );

//     const order = await Order.create({
//       _id: orderId,
//       user: userId,
//       orderItems: orderItems.map((i) => i._id),
//       shippingAddress,
//       paymentMethod,
//       paymentStatus: "pending",
//       orderStatus: "Processing",
//       totalAmount,
//     });

//     return order;
//   }

// ✅ 3. Full Cart
//   async createFromFullCart(userId: string, shippingAddress: ShippingAddress, paymentMethod: string) {
//     const cartItems = await CartItem.find({ user: userId }).populate("product");

//     const orderId = new Types.ObjectId();

//     const orderItems = await OrderItem.insertMany(
//       cartItems.map((item) => ({
//         order: orderId,
//         product: item.product._id,
//         quantity: item.quantity,
//         priceAtPurchase: item.product.price,
//         title: item.product.title,
//         image: item.product.image,
//       }))
//     );

//     const totalAmount = orderItems.reduce(
//       (acc, item) => acc + item.priceAtPurchase * item.quantity,
//       0
//     );

//     const order = await Order.create({
//       _id: orderId,
//       user: userId,
//       orderItems: orderItems.map((i) => i._id),
//       shippingAddress,
//       paymentMethod,
//       paymentStatus: "pending",
//       orderStatus: "Processing",
//       totalAmount,
//     });

//     return order;
//   }
