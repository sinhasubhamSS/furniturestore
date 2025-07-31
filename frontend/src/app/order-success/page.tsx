"use client";
import { useSearchParams } from "next/navigation";
import React from "react";

const OrderSuccessPage = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId");

  // TODO: Replace with actual estimated delivery logic or static value
  const estimatedDelivery = "5 Aug, 2025";

  // Optionally, fetch order details from backend using orderId here

  if (!orderId) {
    return (
      <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow text-center">
        <h2 className="text-xl font-bold text-red-600 mb-4">Order Not Found!</h2>
        <p>Invalid or missing Order ID. Please check your orders or try again.</p>
        <button
          className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded"
          onClick={() => (window.location.href = "/")}
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16 p-6 bg-white rounded shadow text-center">
      <div className="text-4xl mb-4">🎉</div>
      <h2 className="text-2xl font-bold mb-2">Thank You! Your order is placed.</h2>

      <div className="mt-4 mb-2">
        <strong>Order ID:</strong> {orderId}
        {/* You can add a copy button here if you want */}
      </div>
      <div className="mb-2">
        <strong>Expected Delivery:</strong> {estimatedDelivery}
      </div>

      <div className="flex justify-center gap-4 mt-6">
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded"
          onClick={() => (window.location.href = "/products")}
        >
          Explore More Products
        </button>
        <button
          className="px-4 py-2 border border-indigo-600 text-indigo-600 rounded"
          onClick={() => (window.location.href = "/my-orders")}
        >
          My Orders
        </button>
      </div>

      <div className="mt-8 text-sm text-gray-500">
        Having trouble?{" "}
        <a href="/support" className="text-indigo-600 underline">
          Contact Support
        </a>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
