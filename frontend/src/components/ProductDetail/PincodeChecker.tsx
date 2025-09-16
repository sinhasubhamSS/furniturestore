"use client";

import React, { useState } from "react";
import { useCheckDeliveryMutation } from "@/redux/services/user/deliveryApi";
import { CheckCircle, XCircle } from "lucide-react";

interface PincodeCheckerProps {
  className?: string;
}

const PincodeChecker: React.FC<PincodeCheckerProps> = ({ className = "" }) => {
  const [pincode, setPincode] = useState("");
  const [checkDelivery, { data, isLoading, error }] = useCheckDeliveryMutation();
  const [showResult, setShowResult] = useState(false);

  const handleCheck = async () => {
    if (pincode.length === 6) {
      try {
        await checkDelivery({ pincode }).unwrap();
        setShowResult(true);
      } catch (err) {
        setShowResult(false);
        console.error("Delivery check failed:", err);
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
      {/* Label + Input + Button */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2">
        <label htmlFor="pincode" className="sr-only">
          Pincode
        </label>
        <input
          id="pincode"
          type="text"
          inputMode="numeric"
          name="pincode"
          value={pincode}
          onChange={handlePincodeChange}
          onKeyDown={handleKeyDown}
          placeholder="Pincode"
          maxLength={6}
          className="w-full sm:flex-1 px-3 py-2 rounded-md border border-[var(--color-border-custom)] bg-[var(--color-surface)] text-[var(--text-accent)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
        />
        <button
          onClick={handleCheck}
          disabled={isLoading || pincode.length !== 6}
          className={`w-full sm:w-auto px-4 py-2 text-sm font-medium rounded-md text-white transition-colors duration-200 ${
            isLoading || pincode.length !== 6
              ? "bg-[var(--color-accent)]/60 cursor-not-allowed"
              : "bg-[var(--color-accent)] hover:bg-[var(--color-accent)]/90"
          }`}
          style={{ boxShadow: "0 2px 8px rgb(107 60 26 / 0.5)" }}
          aria-label="Check delivery availability"
        >
          {isLoading ? (
            <span className="inline-flex items-center gap-2">
              <span
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                style={{
                  borderColor:
                    "var(--color-accent) transparent transparent transparent",
                }}
              />
              Checking...
            </span>
          ) : (
            "Check"
          )}
        </button>
      </div>

      {/* Error */}
      {Boolean(error) && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          <XCircle className="h-4 w-4 flex-shrink-0" />
          <span>Unable to check delivery. Please try again.</span>
        </div>
      )}

      {/* Minimal Result: Available + Charge */}
      {showResult && data && (
        <div className="p-3 rounded-lg border text-sm flex items-center justify-between gap-3"
             style={{
               backgroundColor: isServiceable ? "var(--green-50, #f0fdf4)" : "var(--red-50, #fef2f2)",
               borderColor: isServiceable ? "var(--green-200, #bbf7d0)" : "var(--red-200, #fecaca)",
               color: "var(--text-accent)"
             }}
        >
          <div className="flex items-center gap-2">
            {isServiceable ? (
              <>
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-700">Available</span>
              </>
            ) : (
              <>
                <XCircle className="h-5 w-5 text-red-600" />
                <span className="font-medium text-red-700">Not Available</span>
              </>
            )}
          </div>

          {/* Charge on right, only if serviceable and charge is a number */}
          <div className="text-right">
            {isServiceable && typeof charge === "number" && (
              <span className="font-semibold">
                ₹{charge}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PincodeChecker;
