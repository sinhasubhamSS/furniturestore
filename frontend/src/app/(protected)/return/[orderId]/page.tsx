"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ReturnEligibility from "@/components/return/returnEligiblity";
import ReturnForm from "@/components/return/returnForm";

// ✅ Define proper types
interface OrderData {
  orderItemsSnapshot: {
    name: string;
    image?: string;
    quantity: number;
    price: number;
  }[];
  orderId: string;
  status: string;
  totalAmount: number;
}

export default function ReturnRequestPage() {
  const { orderId } = useParams();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState<"eligibility" | "form">(
    "eligibility"
  );
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  const handleEligible = (order: OrderData) => {
    console.log("Order eligible:", order);
    setOrderData(order);
    setCurrentStep("form");
  };

  const handleNotEligible = (reason: string) => {
    console.log("Not eligible:", reason);
    alert(`Not eligible for return: ${reason}`);
    router.push("/my-orders");
  };

  const handleReturnSuccess = (returnId: string) => {
    console.log("Return successful:", returnId);
    router.push(`/return-success/${returnId}`);
  };

  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Invalid Order
          </h1>
          <p className="text-gray-600 mb-4">
            Order ID is required to process return.
          </p>
          <button
            onClick={() => router.push("/my-orders")}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Go to My Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/my-orders")}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to My Orders
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Return Request</h1>
          <p className="text-gray-600 mt-2">Order #{orderId}</p>

          {/* Progress Indicator */}
          <div className="mt-6">
            <div className="flex items-center">
              <div
                className={`flex items-center ${
                  currentStep === "eligibility"
                    ? "text-blue-600"
                    : "text-green-600"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    currentStep === "eligibility"
                      ? "border-blue-600"
                      : "border-green-600 bg-green-600"
                  }`}
                >
                  {currentStep === "form" ? (
                    <svg
                      className="w-5 h-5 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <span className="text-sm font-medium">1</span>
                  )}
                </div>
                <span className="ml-2 text-sm font-medium">
                  Check Eligibility
                </span>
              </div>

              <div
                className={`flex-1 h-0.5 mx-4 ${
                  currentStep === "form" ? "bg-green-600" : "bg-gray-300"
                }`}
              ></div>

              <div
                className={`flex items-center ${
                  currentStep === "form" ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    currentStep === "form"
                      ? "border-blue-600"
                      : "border-gray-300"
                  }`}
                >
                  <span className="text-sm font-medium">2</span>
                </div>
                <span className="ml-2 text-sm font-medium">Return Details</span>
              </div>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {currentStep === "eligibility" && (
          <ReturnEligibility
            orderId={orderId as string}
            onEligible={handleEligible}
            onNotEligible={handleNotEligible}
          />
        )}

        {currentStep === "form" && orderData && (
          <ReturnForm
            orderId={orderId as string}
            orderItems={orderData.orderItemsSnapshot}
            onSuccess={handleReturnSuccess}
          />
        )}
      </div>
    </div>
  );
}
