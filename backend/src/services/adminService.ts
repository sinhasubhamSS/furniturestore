import { Order, OrderStatus } from "../models/order.models";
import Product from "../models/product.models";
import User from "../models/user.models";

class AdminService {
  // Total registered users count
  async getTotalUsers(): Promise<number> {
    return User.countDocuments();
  }

  // Total products count
  async getTotalProducts(): Promise<number> {
    return Product.countDocuments();
  }

  // Recent orders - by default last 5 orders sorted by creation date descending
  async getRecentOrders(limit: number = 5) {
    return Order.find({}).sort({ createdAt: -1 }).limit(limit).lean(); // use lean() for plain JS objects if no mongoose docs needed
  }

  // Count of orders which are in 'Pending' status
  async getPendingOrdersCount(): Promise<number> {
    return Order.countDocuments({ status: OrderStatus.Pending });
  }

  // Combined dashboard stats in one method
  async getDashboardStats() {
    const totalUsers = await this.getTotalUsers();
    const totalProducts = await this.getTotalProducts();
    const recentOrders = await this.getRecentOrders();
    const pendingOrdersCount = await this.getPendingOrdersCount();

    return {
      totalUsers,
      totalProducts,
      recentOrders,
      pendingOrdersCount,
    };
  }
}

export const adminService = new AdminService();
