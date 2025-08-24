"use client";

import React, { useState } from "react";
import { ReturnItem, RETURN_REASONS } from "@/types/return";
import { useCreateReturnMutation } from "@/redux/services/user/returnApi";

interface OrderItem {
  name: string;
  image?: string;
  quantity: number;
  price: number;
}

interface ReturnFormProps {
  orderId: string;
  orderItems: OrderItem[];
  onSuccess: (returnId: string) => void;
}

export default function ReturnForm({
  orderId,
  orderItems,
  onSuccess,
}: ReturnFormProps) {
  const [createReturn, { isLoading }] = useCreateReturnMutation();
  const [error, setError] = useState<string | null>(null); // ✅ Add error state

  const [returnItems, setReturnItems] = useState<ReturnItem[]>(
    orderItems.map((_, index) => ({
      orderItemIndex: index,
      quantity: 0,
      reason: "",
      condition: "unopened" as const,
    }))
  );

  const [returnReason, setReturnReason] = useState("");

  const updateReturnItem = (
    index: number,
    field: keyof ReturnItem,
    value: any
  ) => {
    setReturnItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    const itemsToReturn = returnItems.filter((item) => item.quantity > 0);

    if (itemsToReturn.length === 0) {
      setError("Please select at least one item to return");
      return;
    }

    const invalidItems = itemsToReturn.filter((item) => !item.reason.trim());
    if (invalidItems.length > 0) {
      setError("Please provide reason for all selected items");
      return;
    }

    if (!returnReason.trim()) {
      setError("Please provide overall return reason");
      return;
    }

    try {
      const result = await createReturn({
        orderId,
        returnReason,
        returnItems: itemsToReturn,
      }).unwrap();

      onSuccess(result.data.return.returnId);
    } catch (error: any) {
      console.error("Return creation failed:", error);

      // ✅ Enhanced error handling
      if (
        error?.data?.message === "Return request already exists for this order"
      ) {
        setError(
          "You have already submitted a return request for this order. Please check your return status in 'My Orders' section."
        );
      } else if (error?.status === 400) {
        setError(
          error?.data?.message ||
            "Invalid return request. Please check your details."
        );
      } else if (error?.status === 404) {
        setError("Order not found. Please try again or contact support.");
      } else {
        setError("Failed to submit return request. Please try again later.");
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-6">Select Items to Return</h2>

      {/* ✅ Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <svg
              className="h-5 w-5 text-red-400 mr-3 flex-shrink-0"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {orderItems.map((item, index) => (
          <div key={index} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start space-x-4">
              <img
                src={item.image || "/placeholder.png"}
                alt={item.name}
                className="w-20 h-20 object-cover rounded"
              />

              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{item.name}</h3>
                <p className="text-sm text-gray-600">
                  Ordered: {item.quantity} • Price: ₹{item.price}
                </p>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Return Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Return Quantity
                    </label>
                    <select
                      value={returnItems[index]?.quantity || 0}
                      onChange={(e) =>
                        updateReturnItem(
                          index,
                          "quantity",
                          parseInt(e.target.value)
                        )
                      }
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {Array.from({ length: item.quantity + 1 }, (_, i) => (
                        <option key={i} value={i}>
                          {i === 0
                            ? "Don't return"
                            : `${i} item${i > 1 ? "s" : ""}`}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Item Condition */}
                  {returnItems[index]?.quantity > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Item Condition
                      </label>
                      <select
                        value={returnItems[index]?.condition || "unopened"}
                        onChange={(e) =>
                          updateReturnItem(index, "condition", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="unopened">Unopened/New</option>
                        <option value="used">Used but good condition</option>
                        <option value="damaged">Damaged/Defective</option>
                      </select>
                    </div>
                  )}

                  {/* Return Reason */}
                  {returnItems[index]?.quantity > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reason for Return
                      </label>
                      <select
                        value={returnItems[index]?.reason || ""}
                        onChange={(e) =>
                          updateReturnItem(index, "reason", e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select reason</option>
                        {Object.values(RETURN_REASONS).map((reason) => (
                          <option key={reason} value={reason}>
                            {reason}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Overall Return Reason */}
        <div className="bg-gray-50 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Overall Return Reason *
          </label>
          <textarea
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder="Please provide additional details about why you're returning these items..."
            className="w-full border border-gray-300 rounded-md px-3 py-2 h-32 resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Detailed reason helps us improve our products and services.
          </p>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className={`flex-2 py-3 px-6 rounded-lg font-medium text-white transition-colors ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {isLoading
              ? "Submitting Return Request..."
              : "Submit Return Request"}
          </button>
        </div>
      </form>
    </div>
  );
}
