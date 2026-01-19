import { Order, OrderStatus } from "../models/order.models";
import Product from "../models/product.models";
import User from "../models/user.models";

class AdminService {
  // Total registered users
  async getTotalUsers(): Promise<number> {
    return User.countDocuments();
  }

  // Total products
  async getTotalProducts(): Promise<number> {
    return Product.countDocuments();
  }

  // Total orders (🔥 NEW)
  async getTotalOrders(): Promise<number> {
    return Order.countDocuments();
  }

  // Recent orders (last 5)
  async getRecentOrders(limit: number = 5) {
    return Order.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  // Pending orders count
  async getPendingOrdersCount(): Promise<number> {
    return Order.countDocuments({ status: OrderStatus.Pending });
  }

  // Dashboard stats (FINAL)
  async getDashboardStats() {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      recentOrders,
      pendingOrdersCount,
    ] = await Promise.all([
      this.getTotalUsers(),
      this.getTotalProducts(),
      this.getTotalOrders(),      // 👈 added
      this.getRecentOrders(),
      this.getPendingOrdersCount(),
    ]);

    return {
      totalUsers,
      totalProducts,
      totalOrders,                // 👈 added
      recentOrders,
      pendingOrdersCount,
    };
  }
}

export const adminService = new AdminService();
