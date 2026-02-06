"use client";

import React, { useState } from "react";
import { useCheckDeliveryMutation } from "@/redux/services/user/deliveryApi";
import { CheckCircle, XCircle } from "lucide-react";

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
        await checkDelivery({ pincode }).unwrap();
        setShowResult(true);
      } catch {
        setShowResult(false);
      }
    }
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setPincode(value);
    if (showResult && value.length !== 6) setShowResult(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && pincode.length === 6) handleCheck();
  };

  const isServiceable = Boolean(data?.data?.isServiceable);
  const charge = data?.data?.deliveryCharge;

  return (
    <div className={`space-y-2 ${className}`}>
      {/* INPUT ROW */}
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id="pincode"
          type="text"
          inputMode="numeric"
          value={pincode}
          onChange={handlePincodeChange}
          onKeyDown={handleKeyDown}
          placeholder="Enter pincode"
          maxLength={6}
          className="
            w-full sm:flex-1
            px-3 py-2.5
            text-sm
            rounded-md
            border border-gray-300
            bg-white
            focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]
          "
        />

        <button
          onClick={handleCheck}
          disabled={isLoading || pincode.length !== 6}
          className="
            w-full sm:w-auto
            px-4 py-2.5
            text-sm font-semibold
            rounded-md
            text-white
            bg-[var(--color-accent)]
            hover:bg-[var(--color-accent)]/90
            transition
            disabled:opacity-60 disabled:cursor-not-allowed
          "
        >
          {isLoading ? "Checking…" : "Check"}
        </button>
      </div>

      {/* ERROR */}
      {Boolean(error) && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-red-50 border border-red-200 text-red-700 text-xs">
          <XCircle className="h-4 w-4" />
          <span>Unable to check delivery</span>
        </div>
      )}

      {/* RESULT */}
      {showResult && data && (
        <div
          className={`flex items-center justify-between gap-3 px-3 py-2 rounded-md border text-sm
            ${
              isServiceable
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }
          `}
        >
          <div className="flex items-center gap-2">
            {isServiceable ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="font-medium text-green-700">
                  Delivery available
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-600" />
                <span className="font-medium text-red-700">
                  Not deliverable
                </span>
              </>
            )}
          </div>

          {isServiceable && typeof charge === "number" && (
            <span className="font-semibold text-gray-800">₹{charge}</span>
          )}
        </div>
      )}
    </div>
  );
};

export default PincodeChecker;
