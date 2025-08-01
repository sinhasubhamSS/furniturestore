"use client";

import React from "react";
import { useGetMyOrdersQuery } from "@/redux/services/user/orderApi";
import { formatDate } from "../../../../utils/formatDate";

const MyOrders = () => {
  const { data: orders, isLoading, error } = useGetMyOrdersQuery();
  console.log(orders);
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
        {orders.map((order) => (
          <div
            key={order._id}
            className="border rounded-xl p-4 shadow-md bg-white"
          >
            {/* Header */}
            <div className="flex justify-between mb-2">
              <div>
                <p className="font-medium text-gray-700">
                  Order ID: {order._id}
                </p>
                <p className="text-sm text-gray-500">
                  Placed on: {formatDate(order.placedAt)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500">Order Status:</p>
                <p className="text-sm font-medium text-blue-600">
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
              {/* Image neatly contained, always fully visible */}
              <div className="w-16 h-16 rounded border overflow-hidden bg-gray-50 flex items-center justify-center">
                <img
                  src={order.productPreview?.images || "/placeholder.png"}
                  alt={order.productPreview?.name}
                  className="w-full h-full object-contain" // NOTE: Changed to object-contain
                />
              </div>
              <div className="flex-1">
                <p className="font-medium">{order.productPreview?.name}</p>
                <p className="text-sm text-gray-500">
                  Total Items: {order.productPreview?.quantity}
                </p>
              </div>
              <p className="font-semibold text-gray-700">
                ₹{order.totalAmount.toFixed(2)}
              </p>
            </div>

            {/* Shipping Summary */}
            <div className="mt-4 text-sm text-gray-600">
              <p className="font-semibold mb-1">Shipping To:</p>
              <p>{order.shippingSummary?.name}</p>
              <p>
                {order.shippingSummary?.city}, {order.shippingSummary?.state} –{" "}
                {order.shippingSummary?.pincode}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyOrders;
