"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  useGetMyOrdersQuery,
  useCancelOrderMutation,
} from "@/redux/services/user/orderApi";
import { formatDate } from "../../../../utils/formatDate";
// ✅ Use your existing types
import { Order } from "@/types/order";

const MyOrders = () => {
  const router = useRouter();

  // ✅ Simple pagination state
  const [currentPage, setCurrentPage] = React.useState(1);

  // ✅ Updated query with pagination
  const { data, isLoading, error, refetch } = useGetMyOrdersQuery({
    page: currentPage,
    limit: 10,
  });

  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation();

  const handleCancel = async (orderId: string) => {
    if (confirm("Are you sure you want to cancel this order?")) {
      try {
        await cancelOrder({ orderId }).unwrap();
        alert("Order cancelled successfully.");
        refetch();
      } catch (err: any) {
        alert(err?.data?.message || "Failed to cancel order");
      }
    }
  };

  const isReturnEligible = (order: Order) => {
    if (order.status !== "delivered") return false;
    if (order.hasActiveReturn) return false;

    const deliveredDate = new Date(order.placedAt);
    const now = new Date();
    const daysSinceDelivery =
      (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceDelivery <= 7;
  };

  const handleReturn = (orderId: string) => {
    router.push(`/return/${orderId}`);
  };

  if (isLoading) return <p className="text-center mt-6">Loading orders...</p>;
  if (error)
    return (
      <p className="text-center mt-6 text-red-500">Failed to load orders</p>
    );

  // ✅ Simple data extraction
  const orders = data?.orders || [];
  const pagination = data?.pagination;

  if (orders.length === 0)
    return <p className="text-center mt-6">No orders found.</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">My Orders</h2>

      <div className="space-y-6">
        {orders.map((order: Order) => {
          const placedAtDate = new Date(order.placedAt);
          const now = new Date();
          const hoursSincePlaced =
            (now.getTime() - placedAtDate.getTime()) / (1000 * 60 * 60);

          const canCancel =
            order.status !== "cancelled" &&
            order.status !== "delivered" &&
            hoursSincePlaced <= 12;
          const canReturn = isReturnEligible(order);

          return (
            <div
              key={order.orderId || order._id}
              className="border rounded-xl p-4 shadow-md bg-white"
            >
              {/* Header */}
              <div className="flex justify-between mb-2">
                <div>
                  <p className="font-medium text-gray-700">
                    Order ID: {order.orderId}
                  </p>
                  <p className="text-sm text-gray-500">
                    Placed on: {formatDate(order.placedAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Status:</p>
                  <p
                    className={`text-sm font-medium ${
                      order.status === "delivered"
                        ? "text-green-600"
                        : order.status === "cancelled"
                        ? "text-red-600"
                        : order.status === "shipped"
                        ? "text-blue-600"
                        : "text-orange-600"
                    }`}
                  >
                    {order.status?.toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Payment:</p>
                  <p className="text-sm font-medium text-green-600">
                    {order.paymentStatus}
                  </p>
                </div>
              </div>

              {/* Product Preview */}
              <div className="flex items-center gap-4 mt-4">
                <div className="w-16 h-16 rounded border overflow-hidden bg-gray-50 flex items-center justify-center">
                  <img
                    src={order.productPreview?.images || "/placeholder.png"}
                    alt={order.productPreview?.name || "Product"}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{order.productPreview?.name}</p>
                  <p className="text-sm text-gray-500">
                    Items: {order.productPreview?.quantity}
                  </p>
                </div>
                <p className="font-semibold text-gray-700">
                  ₹{order.totalAmount.toFixed(2)}
                </p>
              </div>

              {/* Return Status */}
              {order.hasActiveReturn && order.returnInfo && (
                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-yellow-800">
                        Return Status:{" "}
                        <span className="capitalize">
                          {order.returnInfo.returnStatus}
                        </span>
                      </p>
                      <p className="text-xs text-yellow-600">
                        Return ID: {order.returnInfo.returnId}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        router.push(
                          `/return-tracking/${order.returnInfo?.returnId}`
                        )
                      }
                      className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200"
                    >
                      Track Return
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3 justify-end">
                <button
                  onClick={() => router.push(`/order-details/${order.orderId}`)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm"
                >
                  View Details
                </button>

                {canReturn && !order.hasActiveReturn && (
                  <button
                    onClick={() => handleReturn(order.orderId!)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm"
                  >
                    Return Order
                  </button>
                )}

                {canCancel && (
                  <button
                    onClick={() => handleCancel(order.orderId!)}
                    disabled={isCancelling}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm disabled:opacity-50"
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Order"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-4">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={!pagination.hasPrev}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Previous
          </button>
          <span>
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={!pagination.hasNext}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
