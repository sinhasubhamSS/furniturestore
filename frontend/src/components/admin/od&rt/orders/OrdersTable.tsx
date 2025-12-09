// components/admin/orders/OrdersTable.tsx
import React from "react";
import { AdminOrder } from "@/types/adminorder";
import { OrderStatus } from "@/types/order";
import StatusBadge from "@/components/admin/od&rt/common/StatusBadge";

interface OrdersTableProps {
  orders: AdminOrder[];
  onStatusUpdate: (orderId: string, status: OrderStatus) => void;
  isUpdating: boolean;
}

const OrdersTable: React.FC<OrdersTableProps> = ({
  orders,
  onStatusUpdate,
  isUpdating,
}) => {
  const statusOptions: OrderStatus[] = [
    "pending",
    "confirmed",
    "shipped",
    "out_for_delivery",
    "delivered",
    "refunded",
    "cancelled",
  ];

  const handleStatusChange = (orderId: string, newStatus: string) => {
    if (window.confirm(`Update order status to ${newStatus}?`)) {
      onStatusUpdate(orderId, newStatus as OrderStatus);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="text-gray-400 text-xl mb-2">📦</div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          No orders found
        </h3>
        <p className="text-gray-500">No orders match your current filters.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Order Details
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {orders.map((order) => (
            <tr key={order._id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {order.orderId}
                  </div>
                  {order.hasActiveReturn && (
                    <div className="text-xs text-orange-600 font-medium">
                      🔄 Return: {order.returnInfo?.returnStatus}
                    </div>
                  )}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {order.user?.name || "N/A"}
                  </div>
                  <div className="text-xs text-gray-500">
                    {order.user?.email}
                  </div>
                  {order.user?.mobile && (
                    <div className="text-xs text-gray-500">
                      📞 {order.user.mobile}
                    </div>
                  )}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  ₹{order.totalAmount?.toLocaleString("en-IN")}
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={order.status} type="order" />
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(order.placedAt!).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </td>

              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={order.status}
                  onChange={(e) =>
                    handleStatusChange(order._id, e.target.value)
                  }
                  disabled={isUpdating}
                  className="text-xs border border-gray-300 rounded px-2 py-1 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
