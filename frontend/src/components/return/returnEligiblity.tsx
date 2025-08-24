"use client";

import React from "react";
import { useCheckEligibilityQuery } from "@/redux/services/user/returnApi";

interface ReturnEligibilityProps {
  orderId: string;
  onEligible: (order: any) => void;
  onNotEligible: (reason: string) => void;
}

export default function ReturnEligibility({
  orderId,
  onEligible,
  onNotEligible,
}: ReturnEligibilityProps) {
  const { data, isLoading, error } = useCheckEligibilityQuery({ orderId });

  React.useEffect(() => {
    if (data?.data?.isEligible && data.data.order) {
      onEligible(data.data.order);
    } else if (data?.data && !data.data.isEligible) {
      onNotEligible(data.data.reason || "Order not eligible for return");
    }
  }, [data, onEligible, onNotEligible]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">Checking return eligibility...</p>
        <p className="text-sm text-gray-500 mt-2">
          Please wait while we verify your order details
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-red-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800 mb-2">
              Unable to Check Eligibility
            </h3>
            <p className="text-red-700 mb-4">
              We encountered an error while checking if your order is eligible
              for return.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (data?.data?.isEligible) {
    const timeRemainingDays = Math.ceil(
      data.data.timeRemaining / (1000 * 60 * 60 * 24)
    );

    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-6 w-6 text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-green-800 mb-2">
              ✅ Order Eligible for Return
            </h3>
            <div className="text-green-700 space-y-1">
              <p>Your order qualifies for our return policy.</p>
              <p className="text-sm">
                <strong>Time remaining:</strong> {timeRemainingDays} day
                {timeRemainingDays !== 1 ? "s" : ""}
                {timeRemainingDays <= 2 && (
                  <span className="text-orange-600 font-medium">
                    {" "}
                    (Limited time!)
                  </span>
                )}
              </p>
              <p className="text-sm">
                You can return eligible items within our return window.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-red-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-lg font-medium text-red-800 mb-2">
            ❌ Not Eligible for Return
          </h3>
          <p className="text-red-700 mb-4">
            {data?.data?.reason ||
              "This order doesn't meet our return policy requirements."}
          </p>
          <div className="text-sm text-red-600">
            <p>
              <strong>Common reasons:</strong>
            </p>
            <ul className="list-disc list-inside mt-1 space-y-1">
              <li>Return window has expired (usually 7 days)</li>
              <li>Order hasn't been delivered yet</li>
              <li>Items are non-returnable (digital products, perishables)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
