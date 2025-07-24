"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetProductByIDQuery } from "@/redux/services/user/publicProductApi";
import { useState } from "react";
import axiosClient from "../../../../utils/axios";
import { setPaymentMethod } from "@/redux/slices/checkoutSlice";

const PaymentPage = () => {
  const dispatch = useDispatch();

  const { productId, quantity } = useSelector(
    (state: RootState) => state.checkout
  );

  const {
    data: product,
    isLoading,
    error,
  } = useGetProductByIDQuery(productId!, {
    skip: !productId,
  });

  const [selectedMethod, setSelectedMethod] = useState<
    "card" | "upi" | "netbanking" | "cod" | null
  >(null);

  if (!productId || !quantity) {
    return <p className="text-center text-red-500">Invalid payment session.</p>;
  }

  if (isLoading) {
    return <p className="text-center">Loading...</p>;
  }

  if (error || !product) {
    return <p className="text-center text-red-500">Failed to load product.</p>;
  }

  const total = product.price * quantity;

  const handlePayment = () => {
    if (!selectedMethod) return;

    // Example alerts — you’ll replace this later with actual order placing logic
    if (selectedMethod === "cod") {
      alert("Order placed with Cash on Delivery");
    } else {
      alert(`Razorpay will open for ${selectedMethod}`);
    }
  };

  const handleSelectMethod = (
    method: "card" | "upi" | "netbanking" | "cod"
  ) => {
    setSelectedMethod(method);
    dispatch(setPaymentMethod(method === "cod" ? "COD" : "RAZORPAY"));
  };

  return (
    <div className="max-w-xl mx-auto p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">Payment Page</h1>
      <p className="text-lg font-medium">{product.name}</p>
      <p className="mb-2">Quantity: {quantity}</p>
      <p className="text-xl font-semibold mb-6">Total: ₹ {total.toFixed(2)}</p>

      <div className="flex flex-col gap-3 items-start mb-6">
        <p className="font-semibold">Choose Payment Method:</p>
        {["card", "upi", "netbanking", "cod"].map((method) => (
          <label
            key={method}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="radio"
              name="payment"
              value={method}
              checked={selectedMethod === method}
              onChange={() => handleSelectMethod(method as any)}
            />
            {method === "card" && "Credit / Debit Card"}
            {method === "upi" && "UPI"}
            {method === "netbanking" && "Net Banking"}
            {method === "cod" && "Cash on Delivery"}
          </label>
        ))}
      </div>

      <button
        onClick={handlePayment}
        disabled={!selectedMethod}
        className="bg-green-600 text-white py-2 px-6 rounded disabled:opacity-50"
      >
        {selectedMethod === "cod" ? "Place Order" : "Pay Now"}
      </button>
    </div>
  );
};

export default PaymentPage;
