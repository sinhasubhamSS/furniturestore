import React from "react";
import { AdminOrder } from "@/types/adminorder";
import { OrderStatus } from "@/types/order";
import StatusBadge from "@/components/admin/od&rt/common/StatusBadge";

interface Props {
  orders: AdminOrder[];
  onStatusUpdate: (orderId: string, status: OrderStatus) => void;
  isUpdating: boolean;
}

const OrdersTable: React.FC<Props> = ({
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

  const handleChange = (id: string, status: string) => {
    if (confirm(`Update status to ${status}?`)) {
      onStatusUpdate(id, status as OrderStatus);
    }
  };

  /* ================= MOBILE VIEW ================= */
  return (
    <>
      <div className="block md:hidden space-y-4 p-4">
        {orders.map((order) => (
          <div
            key={order._id}
            className="border rounded-xl p-4 shadow-sm bg-white space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="font-semibold text-sm">#{order.orderId}</span>
              <StatusBadge status={order.status} type="order" />
            </div>

            <div className="text-sm">
              <p className="font-medium">{order.user?.name}</p>
              <p className="text-xs text-gray-500">{order.user?.email}</p>
              {order.user?.mobile && (
                <p className="text-xs">📞 {order.user.mobile}</p>
              )}
            </div>

            <div className="flex justify-between text-sm">
              <span className="font-semibold">
                ₹{order.totalAmount.toLocaleString("en-IN")}
              </span>
              <span className="text-gray-500">
                {new Date(order.placedAt!).toLocaleDateString()}
              </span>
            </div>

            <select
              value={order.status}
              disabled={isUpdating}
              onChange={(e) => handleChange(order._id, e.target.value)}
              className="w-full border rounded-md px-3 py-2 text-sm cursor-pointer"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s.replace(/_/g, " ").toUpperCase()}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* ================= DESKTOP TABLE ================= */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-gray-50">
            <tr>
              {["Order", "Customer", "Amount", "Status", "Date", "Action"].map(
                (h) => (
                  <th
                    key={h}
                    className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase"
                  >
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>

          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 font-medium">{order.orderId}</td>

                <td className="px-6 py-4">
                  <div className="text-sm font-medium">{order.user?.name}</div>
                  <div className="text-xs text-gray-500">
                    {order.user?.email}
                  </div>
                </td>

                <td className="px-6 py-4 font-medium">
                  ₹{order.totalAmount.toLocaleString("en-IN")}
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={order.status} type="order" />
                </td>

                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(order.placedAt!).toLocaleDateString()}
                </td>

                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    disabled={isUpdating}
                    onChange={(e) => handleChange(order._id, e.target.value)}
                    className="text-xs border rounded px-2 py-1 cursor-pointer"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>
                        {s.replace(/_/g, " ").toUpperCase()}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default OrdersTable;
