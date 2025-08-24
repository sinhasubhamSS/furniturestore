"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  useGetMyOrdersQuery,
  useCancelOrderMutation,
} from "@/redux/services/user/orderApi";
import { formatDate } from "../../../../utils/formatDate";
// ✅ Import return types separately
import { Return, ReturnStatus } from "@/types/return";

// ✅ Extended Order type for MyOrders API response
interface OrderWithReturnInfo {
  _id: string;
  orderId: string;
  placedAt: string;
  paymentStatus: "paid" | "unpaid";
  status: "pending" | "shipped" | "delivered" | "cancelled";
  totalAmount: number;

  // ✅ Return information from backend
  hasActiveReturn: boolean;
  returnInfo?: {
    hasActiveReturn: boolean;
    returnStatus: string;
    returnId: string;
    returnRequestedAt: string;
  } | null;

  productPreview: {
    name: string;
    quantity: number;
    images: string;
  };

  shippingSummary: {
    name: string;
    city: string;
    state: string;
    pincode: string;
  };
}

const MyOrders = () => {
  const router = useRouter();
  const { data: orders, isLoading, error, refetch } = useGetMyOrdersQuery();
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

  // ✅ Enhanced return eligibility with proper typing
  const isReturnEligible = (order: OrderWithReturnInfo) => {
    if (order.status !== "delivered") return false;
    if (order.hasActiveReturn) return false;

    const deliveredDate = new Date(order.placedAt);
    const now = new Date();
    const daysSinceDelivery =
      (now.getTime() - deliveredDate.getTime()) / (1000 * 60 * 60 * 24);

    return daysSinceDelivery <= 7;
  };

  const handleReturn = (customOrderId: string) => {
    console.log("Navigating to return page with orderId:", customOrderId);
    router.push(`/return/${customOrderId}`);
  };

  if (isLoading) return <p className="text-center mt-6">Loading orders...</p>;
  if (error)
    return (
      <p className="text-center mt-6 text-red-500">Failed to load orders</p>
    );
  if (!orders || orders.length === 0)
    return <p className="text-center mt-6">No orders found.</p>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold mb-6">My Orders</h2>

      <div className="space-y-6">
        {(orders as OrderWithReturnInfo[]).map((order) => {
          const placedAtDate = new Date(order.placedAt);
          const now = new Date();
          const hoursSincePlaced =
            (now.getTime() - placedAtDate.getTime()) / (1000 * 60 * 60);
          const canCancel =
            order.status !== "cancelled" && hoursSincePlaced <= 12;
          const canReturn = isReturnEligible(order);

          return (
            <div
              key={order.orderId}
              className="border rounded-xl p-4 shadow-md bg-white relative"
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
                  <p className="text-sm text-gray-500">Order Status:</p>
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
                    {order.status}
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
                  <p className="font-medium">
                    {order.productPreview?.name || "Product"}
                  </p>
                  <p className="text-sm text-gray-500">
                    Total Items: {order.productPreview?.quantity || 0}
                  </p>
                </div>
                <p className="font-semibold text-gray-700">
                  ₹{order.totalAmount.toFixed(2)}
                </p>
              </div>

              {/* Shipping Summary */}
              <div className="mt-4 text-sm text-gray-600">
                <p className="font-semibold mb-1">Shipping To:</p>
                <p>{order.shippingSummary?.name || "N/A"}</p>
                <p>
                  {order.shippingSummary?.city || "N/A"},{" "}
                  {order.shippingSummary?.state || "N/A"} –{" "}
                  {order.shippingSummary?.pincode || "N/A"}
                </p>
              </div>

              {/* ✅ Return Status Display with Safe Access */}
              {order.hasActiveReturn && order.returnInfo && (
                <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <svg
                        className="h-4 w-4 text-yellow-400 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
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
                    </div>
                    {/* ✅ Safe navigation with optional chaining */}
                    <button
                      onClick={() => {
                        if (order.returnInfo?.returnId) {
                          router.push(
                            `/return-tracking/${order.returnInfo.returnId}`
                          );
                        }
                      }}
                      className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded hover:bg-yellow-200 transition-colors"
                    >
                      Track Return
                    </button>
                  </div>
                </div>
              )}

              {/* ✅ Action Buttons */}
              <div className="mt-4 pt-4 border-t border-gray-200 flex flex-wrap gap-3 justify-end">
                <button
                  onClick={() => router.push(`/order-details/${order.orderId}`)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  View Details
                </button>

                {/* ✅ Return Button */}
                {canReturn && !order.hasActiveReturn && (
                  <button
                    onClick={() => handleReturn(order.orderId)}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    Return Order
                  </button>
                )}

                {/* ✅ Disabled Return Button */}
                {order.hasActiveReturn && order.status === "delivered" && (
                  <button
                    disabled
                    className="bg-gray-300 text-gray-500 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
                    title={`Return already requested (${
                      order.returnInfo?.returnStatus || "Processing"
                    })`}
                  >
                    Return Requested
                  </button>
                )}

                <button
                  onClick={() =>
                    router.push(
                      `/support/create-ticket?orderId=${order.orderId}`
                    )
                  }
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Get Help
                </button>

                {canCancel && (
                  <button
                    onClick={() => handleCancel(order.orderId)}
                    disabled={isCancelling}
                    className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Order"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyOrders;
