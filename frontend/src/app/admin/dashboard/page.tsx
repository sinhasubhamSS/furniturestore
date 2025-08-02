"use client";
import { useState } from "react";
import { useGetDashboardStatsQuery } from "../../../redux/services/admin/adminDashboard";


export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  
  // ✅ Real API data fetch karna
  const { data: dashboardData, error, isLoading } = useGetDashboardStatsQuery();

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">Error loading dashboard data</div>
        </div>
      </div>
    );
  }

  // ✅ Real stats data - API se aaya hua data use kar rahe hain
  const stats = [
    {
      title: "Total Users",
      value: dashboardData?.totalUsers || 0,
      change: "+8%", // Ye calculation backend se bhi aa sakti hai
      trend: "up",
      icon: "👥",
    },
    {
      title: "Total Products", 
      value: dashboardData?.totalProducts || 0,
      change: "+12%",
      trend: "up", 
      icon: "📦"
    },
    {
      title: "Pending Orders",
      value: dashboardData?.pendingOrdersCount || 0,
      change: "-2%",
      trend: "down",
      icon: "⏳",
    },
    {
      title: "Total Orders",
      value: dashboardData?.recentOrders?.length || 0,
      change: "+15%",
      trend: "up",
      icon: "🛒",
    },
  ];

  // ✅ Recent orders - Real data use kar rahe hain
  const recentOrders = dashboardData?.recentOrders?.slice(0, 5) || [];

  return (
    <div className="p-4 md:p-6 space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[var(--foreground)]">
            Admin Dashboard
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

      {/* Stats Grid - Real API data */}
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

        {/* Quick Stats */}
        <div className="bg-[var(--card-bg)] p-5 rounded-xl shadow-sm border border-[var(--color-secondary)]">
          <h2 className="text-lg font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-accent)]">Total Users</span>
              <span className="font-semibold">{dashboardData?.totalUsers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-accent)]">Total Products</span>
              <span className="font-semibold">{dashboardData?.totalProducts || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-[var(--text-accent)]">Pending Orders</span>
              <span className="font-semibold">{dashboardData?.pendingOrdersCount || 0}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders - Real API data */}
      <div className="bg-[var(--card-bg)] p-5 rounded-xl shadow-sm border border-[var(--color-secondary)]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <button className="text-sm text-[var(--color-accent)] hover:underline">
            View all orders →
          </button>
        </div>
        
        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-secondary)]">
                  <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-accent)]">
                    Order ID
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-accent)]">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-[var(--text-accent)]">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order, index) => (
                  <tr
                    key={index}
                    className="border-b border-[var(--color-secondary)] hover:bg-[var(--background)] transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-4 font-medium">{order._id?.slice(-8) || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === "delivered"
                            ? "bg-green-100 text-green-800"
                            : order.status === "shipped"
                            ? "bg-blue-100 text-blue-800"
                            : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {order.status?.charAt(0).toUpperCase() + order.status?.slice(1)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {new Date(order.placedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-[var(--text-accent)]">
            No recent orders found
          </div>
        )}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--color-secondary)]">
          <h3 className="text-sm font-medium text-[var(--text-accent)] mb-2">
            Total Users
          </h3>
          <p className="text-2xl font-bold">{dashboardData?.totalUsers || 0}</p>
          <p className="text-sm text-green-500 mt-1">↑ Registered users</p>
        </div>
        <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--color-secondary)]">
          <h3 className="text-sm font-medium text-[var(--text-accent)] mb-2">
            Products Available
          </h3>
          <p className="text-2xl font-bold">{dashboardData?.totalProducts || 0}</p>
          <p className="text-sm text-blue-500 mt-1">↑ In inventory</p>
        </div>
        <div className="bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--color-secondary)]">
          <h3 className="text-sm font-medium text-[var(--text-accent)] mb-2">
            Pending Orders
          </h3>
          <p className="text-2xl font-bold">{dashboardData?.pendingOrdersCount || 0}</p>
          <p className="text-sm text-[var(--text-accent)] mt-1">
            Need attention
          </p>
        </div>
      </div>
    </div>
  );
}
