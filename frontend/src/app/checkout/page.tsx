"use client";

import AddressSection from "@/components/checkout/AddressSection";
import CheckoutSummary from "@/components/checkout/CheckoutSummary";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Page() {
  const router = useRouter();
  const [addressSelected, setAddressSelected] = useState(false);

  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-10">Checkout</h1>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          {/* Left: Address */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <AddressSection onSelectionChange={setAddressSelected} />
          </div>

          {/* Right: Summary */}
          <div className="bg-white p-6 rounded-xl shadow-md sticky top-10 self-start">
            <CheckoutSummary />
            <button
              onClick={() => router.push("/checkout/payment")}
              className={`mt-6 w-full py-3 rounded-lg font-semibold transition 
    ${
      addressSelected
        ? "bg-blue-600 text-white hover:bg-blue-700"
        : "bg-gray-300 text-gray-500 cursor-not-allowed"
    }`}
              disabled={!addressSelected}
            >
              Proceed to Pay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
