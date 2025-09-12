"use client";

import React, { useState } from "react";
import { useCheckDeliveryMutation } from "@/redux/services/user/deliveryApi";
import { Truck, Clock, CreditCard, CheckCircle, XCircle } from "lucide-react";

interface PincodeCheckerProps {
  className?: string;
}

const PincodeChecker: React.FC<PincodeCheckerProps> = ({ className = "" }) => {
  const [pincode, setPincode] = useState("");
  const [checkDelivery, { data, isLoading, error }] =
    useCheckDeliveryMutation();
  const [showResult, setShowResult] = useState(false);

  const handleCheck = async () => {
    if (pincode.length === 6) {
      try {
        await checkDelivery({ pincode });
        setShowResult(true);
      } catch (err) {
        console.error("Delivery check failed:", err);
      }
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPincode(value);
    if (showResult && value.length !== 6) {
      setShowResult(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && pincode.length === 6) {
      handleCheck();
    }
  };

  return (
    <div className={`delivery-checker space-y-1 ${className}`}>
      {/* Input and Button container with flex and responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <input
          type="text"
          name="pincode"
          value={pincode}
          onChange={handlePincodeChange}
          onKeyPress={handleKeyPress}
          placeholder="Enter 6-digit pincode"
          maxLength={6}
          className="flex-grow sm:flex-grow-0 sm:basis-[150px] pl-10 py-2 border border-[var(--color-border-custom)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] text-[var(--text-accent)]"
          style={{ backgroundColor: "var(--color-surface)", minWidth: "0" }}
        />
        <button
          onClick={handleCheck}
          disabled={isLoading || pincode.length !== 6}
          className={`w-full sm:w-auto min-w-[100px] px-4 text-sm font-medium rounded-md text-white flex items-center justify-center gap-2 transition-colors duration-200 ${
            isLoading || pincode.length !== 6
              ? "bg-[var(--color-accent)]/60 cursor-not-allowed"
              : "bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90"
          }`}
          style={{ boxShadow: "0 2px 8px rgb(107 60 26 / 0.5)" }}
        >
          {isLoading && (
            <div
              className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              style={{
                borderColor:
                  "var(--color-accent) transparent transparent transparent",
              }}
            ></div>
          )}
          {isLoading ? "Checking..." : "Check"}
        </button>
      </div>

      {/* Error State */}
      {Boolean(error) && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <XCircle className="h-4 w-4 flex-shrink-0" />
          <span>Unable to check delivery. Please try again.</span>
        </div>
      )}

      {/* Results Section */}
      {showResult && data && (
        <div className="delivery-result">
          {data.data.isServiceable ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg space-y-3">
              {/* Header */}
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Delivery Available!</span>
              </div>

              {/* Location Info */}
              <div className="text-sm text-[var(--text-accent)]">
                <span className="font-medium">
                  {data.data.city}, {data.data.state}
                </span>
                {data.data.zone && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                    Zone {data.data.zone}
                  </span>
                )}
              </div>

              {/* Delivery Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[var(--text-accent)]">
                <div className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-gray-500" />
                  <span>Delivery:</span>
                  <span className="font-medium">
                    ₹{data.data.deliveryCharge}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span>Time:</span>
                  <span className="font-medium">
                    {data.data.deliveryDays} days
                  </span>
                </div>

                {data.data.codAvailable && (
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-gray-500" />
                    <span>COD:</span>
                    <span className="font-medium text-green-600">
                      Available
                    </span>
                  </div>
                )}

                {data.data.courierPartner && (
                  <div className="flex items-center gap-2">
                    <span>Partner:</span>
                    <span className="font-medium">
                      {data.data.courierPartner}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <div className="flex items-center gap-2">
                <XCircle className="h-5 w-5 flex-shrink-0" />
                <span className="font-medium">Not Available</span>
              </div>
              <p className="mt-2">
                {data.data.message || "Delivery not available in this area"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PincodeChecker;
