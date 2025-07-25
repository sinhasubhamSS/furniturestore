"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetProductByIDQuery } from "@/redux/services/user/publicProductApi";
import { useCreateOrderMutation } from "@/redux/services/user/orderApi";
import { useState } from "react";
import { setPaymentMethod, resetCheckout } from "@/redux/slices/checkoutSlice";
import { useRouter } from "next/navigation";

const PaymentPage = () => {
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const dispatch = useDispatch();
  const router = useRouter();

  const {
    productId,
    quantity,
    selectedAddress: shippingAddress,
    paymentMethod,
  } = useSelector((state: RootState) => state.checkout);

  const {
    data: product,
    isLoading: productLoading,
    error: productError,
  } = useGetProductByIDQuery(productId!, {
    skip: !productId,
  });

  const [selectedMethod, setSelectedMethod] = useState<
    "card" | "upi" | "netbanking" | "cod" | null
  >(null);

  const [createOrder, { isLoading: orderLoading }] = useCreateOrderMutation();

  const total = product ? product.price * quantity : 0;

  const handleSelectMethod = (
    method: "card" | "upi" | "netbanking" | "cod"
  ) => {
    setSelectedMethod(method);
    dispatch(setPaymentMethod(method === "cod" ? "COD" : "RAZORPAY"));
  };

  const handlePayment = async () => {
    if (!selectedMethod || !shippingAddress || !paymentMethod) {
      alert("Missing payment method or shipping address.");
      return;
    }

    const payload = {
      items: [
        {
          productId: productId!,
          quantity,
        },
      ],
      shippingAddress,
      payment: {
        method: paymentMethod,
        razorpayOrderId: undefined,
        // Add real ID when Razorpay is integrated
      },
    };

    try {
      const res = await createOrder({ userId: "", data: payload }).unwrap();
      alert("Order placed successfully!");
      dispatch(resetCheckout());
      // router.push(`/order-success/${res.orderId}`);
    } catch (err: any) {
      console.error("Order failed", err);
      alert(err?.data?.message || "Failed to place order.");
    }
  };

  if (!productId || !quantity) {
    return <p className="text-center text-red-500">Invalid payment session.</p>;
  }

  if (productLoading) return <p className="text-center">Loading product...</p>;
  if (productError || !product)
    return <p className="text-center text-red-500">Failed to load product.</p>;

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
        disabled={!selectedMethod || orderLoading}
        className="bg-green-600 text-white py-2 px-6 rounded disabled:opacity-50"
      >
        {orderLoading
          ? "Placing Order..."
          : selectedMethod === "cod"
          ? "Place Order"
          : "Pay Now"}
      </button>
    </div>
  );
};

export default PaymentPage;
