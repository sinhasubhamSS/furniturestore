"use client";
import { useState } from "react";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Sample data - replace with real API data
  //sample admin dashboar aur jab user ka sara feature complete ho jaiga tab then jake isko sahi sa update karunga aur admin ka kuch kuch jasie total revenue and all nikalunga

  const stats = [
    {
      title: "Total Revenue",
      value: "$24,567",
      change: "+18%",
      trend: "up",
      icon: "💰",
    },
    { title: "Orders", value: "342", change: "+12%", trend: "up", icon: "📦" },
    {
      title: "Customers",
      value: "1,289",
      change: "+8%",
      trend: "up",
      icon: "👥",
    },
    {
      title: "Return Rate",
      value: "4.2%",
      change: "-1%",
      trend: "down",
      icon: "🔄",
    },
  ];

  const popularProducts = [
    { name: "Nordic Oak Chair", sales: 142, revenue: "$8,520" },
    { name: "Minimalist Coffee Table", sales: 98, revenue: "$6,860" },
    { name: "Scandinavian Sofa", sales: 76, revenue: "$15,200" },
  ];

  const recentOrders = [
    {
      id: "#FUR-1001",
      customer: "Alex Johnson",
      amount: "$450",
      status: "shipped",
      items: 2,
    },
    {
      id: "#FUR-1002",
      customer: "Sarah Miller",
      amount: "$1,200",
      status: "processing",
      items: 3,
    },
    {
      id: "#FUR-1003",
      customer: "David Wilson",
      amount: "$780",
      status: "delivered",
      items: 1,
    },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            Furniture Dashboard
          </h1>
          <p className="text-sm text-[var(--text-accent)]">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>

        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-[var(--color-accent)] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2">
            <span>+</span> New Product
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="bg-[var(--card-bg)] p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-[var(--color-secondary)]"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-[var(--text-accent)]">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <span className="text-2xl">{stat.icon}</span>
            </div>
            <div
              className={`flex items-center mt-3 text-sm ${
                stat.trend === "up" ? "text-green-500" : "text-red-500"
              }`}
            >
              {stat.change} {stat.trend === "up" ? "↑" : "↓"}
              <span className="text-[var(--muted-foreground)] text-xs ml-2">
                vs last month
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-[var(--card-bg)] p-5 rounded-xl shadow-sm border border-[var(--color-secondary)]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Sales Performance</h2>
            <select className="bg-[var(--background)] text-[var(--foreground)] border border-[var(--color-secondary)] rounded-md px-3 py-1 text-sm">
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last 90 days</option>
            </select>
          </div>
          <div className="h-64 bg-gradient-to-br from-[var(--color-secondary)]/10 to-[var(--color-primary)] rounded-lg flex items-center justify-center">
            <p className="text-[var(--text-accent)]">
              Interactive chart will appear here
            </p>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-[var(--card-bg)] p-5 rounded-xl shadow-sm border border-[var(--color-secondary)]">
          <h2 className="text-lg font-semibold mb-4">Popular Products</h2>
          <div className="space-y-4">
            {popularProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-2 hover:bg-[var(--background)] rounded-lg transition-colors"
              >
                <div className="w-10 h-10 rounded-md bg-[var(--color-secondary)] flex items-center justify-center">
                  <span className="text-lg">🪑</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{product.name}</p>
                  <p className="text-sm text-[var(--text-accent)]">
                    {product.sales} sold
                  </p>
                </div>
                <p className="font-medium">{product.revenue}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-[var(--color-accent)] hover:underline">
            View all products →
          </button>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-[var(--card-bg)] p-5 rounded-xl shadow-sm border border-[var(--color-secondary)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <button className="text-sm text-[var(--color-accent)] hover:underline">
            View all orders →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[var(--color-secondary)]">
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-accent)]">
                  Order ID
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-accent)]">
                  Customer
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-accent)]">
                  Amount
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-accent)]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order, index) => (
                <tr
                  key={index}
                  className="border-b border-[var(--color-secondary)] hover:bg-[var(--background)] transition-colors cursor-pointer"
                >
                  <td className="py-3 px-4 font-medium">{order.id}</td>
                  <td className="py-3 px-4">{order.customer}</td>
                  <td className="py-3 px-4">{order.amount}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === "delivered"
                          ? "bg-green-100 text-green-800"
                          : order.status === "shipped"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--color-secondary)]">
          <h3 className="text-sm font-medium text-[var(--text-accent)] mb-2">
            Average Order Value
          </h3>
          <p className="text-2xl font-bold">$189.42</p>
          <p className="text-sm text-green-500 mt-1">↑ 12% from last month</p>
        </div>
        <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--color-secondary)]">
          <h3 className="text-sm font-medium text-[var(--text-accent)] mb-2">
            Conversion Rate
          </h3>
          <p className="text-2xl font-bold">3.2%</p>
          <p className="text-sm text-green-500 mt-1">↑ 0.4% from last month</p>
        </div>
        <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--color-secondary)]">
          <h3 className="text-sm font-medium text-[var(--text-accent)] mb-2">
            Inventory Alert
          </h3>
          <p className="text-2xl font-bold">8 Items</p>
          <p className="text-sm text-[var(--text-accent)] mt-1">
            Low stock products
          </p>
        </div>
      </div>
    </div>
  );
}
