// services/orderService.ts
import { Cart } from "../models/cart.model";
import { Order, OrderStatus, PaymentMethod } from "../models/order.models";
import Product, { ProductDocument } from "../models/product.models";
import { AppError } from "../utils/AppError";
import {
  AddressSnapshot,
  ProductSnapshot,
  PaymentInfo,
} from "../types/orderservicetypes";
import { Types } from "mongoose";

interface CartItemWithProduct {
  product: ProductDocument;
  quantity: number;
}

class OrderService {
  async createOrder(
    userId: string,
    type: "buy-now" | "cart-all" | "cart-selected",
    payload: {
      productId?: string;
      quantity?: number;
      selectedIds?: string[];
      address: AddressSnapshot;
      paymentMethod: PaymentMethod;
    }
  ) {
    let products: ProductSnapshot[] = [];
    let totalAmount = 0;

    // ✅ Buy Now flow
    if (type === "buy-now") {
      const { productId, quantity = 1 } = payload;

      const product = await Product.findById(productId);
      if (!product) throw new AppError("Product not found", 404);
      if (product.stock < quantity) {
        throw new AppError(
          `Only ${product.stock} items available for ${product.name}`,
          400
        );
      }

      products = [
        {
          productId: product._id.toString(),
          name: product.name,
          image: product.images[0] || "", // Use first image
          quantity,
          price: product.price,
        },
      ];
      totalAmount = product.price * quantity;
    }

    // ✅ Cart Based (All or Selected)
    if (type === "cart-all" || type === "cart-selected") {
      // Find cart with populated products
      const cart = await Cart.findOne({ user: userId }).populate<{
        items: CartItemWithProduct[];
      }>("items.product");

      if (!cart || cart.items.length === 0) {
        throw new AppError("Cart is empty", 400);
      }

      // Filter items based on selection type
      let items = cart.items;
      if (type === "cart-selected") {
        items = items.filter((item) =>
          payload.selectedIds?.includes(item.product._id.toString())
        );
      }

      if (items.length === 0) {
        throw new AppError("No items found for order", 400);
      }

      // Check stock and prepare products
      for (const item of items) {
        if (item.product.stock < item.quantity) {
          throw new AppError(
            `Only ${item.product.stock} items available for ${item.product.name}`,
            400
          );
        }
      }

      products = items.map((item) => ({
        productId: item.product._id.toString(),
        name: item.product.name,
        image: item.product.images[0] || "", // Use first image
        quantity: item.quantity,
        price: item.product.price,
      }));

      totalAmount = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );
    }

    // ✅ Create order
    const paymentSnapshot: PaymentInfo = {
      method: payload.paymentMethod,
      status: "pending",
    };

    const newOrder = await Order.create({
      user: userId,
      orderItemsSnapshot: products,
      shippingAddressSnapshot: payload.address,
      paymentSnapshot,
      status:
        payload.paymentMethod === PaymentMethod.COD
          ? OrderStatus.Confirmed
          : OrderStatus.Pending,
      totalAmount,
      placedAt: new Date(),
    });

    // ✅ Update stock
    const updateOperations = products.map((product) =>
      Product.findByIdAndUpdate(
        product.productId,
        { $inc: { stock: -product.quantity } },
        { new: true }
      )
    );

    await Promise.all(updateOperations);

    return newOrder;
  }
}

export const orderService = new OrderService();
