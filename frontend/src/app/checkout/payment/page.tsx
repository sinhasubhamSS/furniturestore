"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { useGetProductByIDQuery } from "@/redux/services/user/publicProductApi";
import {
  useCreateOrderMutation,
  useCreateRazorpayOrderMutation,
} from "@/redux/services/user/orderApi";
import { resetCheckout, setPaymentMethod } from "@/redux/slices/checkoutSlice";
import { useRouter } from "next/navigation";

const PaymentPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    productId,
    quantity,
    selectedAddress: shippingAddress,
    paymentMethod,
  } = useSelector((state: RootState) => state.checkout);

  const { data: product, isLoading } = useGetProductByIDQuery(productId!, {
    skip: !productId,
  });

  const [selectedMethod, setSelectedMethod] = useState<
    "card" | "upi" | "netbanking" | "cod" | null
  >(null);
  const [createOrder, { isLoading: placingOrder }] = useCreateOrderMutation();
  const [createRazorpayOrder] = useCreateRazorpayOrderMutation();

  const total = product ? product.price * quantity : 0;
  console.log("🧮 TOTAL amount before Razorpay:", total);

  const loadRazorpayScript = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleSelectMethod = (
    method: "card" | "upi" | "netbanking" | "cod"
  ) => {
    setSelectedMethod(method);
    dispatch(setPaymentMethod(method === "cod" ? "COD" : "RAZORPAY"));
  };

  const handlePayment = async () => {
    if (
      !selectedMethod ||
      !shippingAddress ||
      !paymentMethod ||
      !productId ||
      !product
    ) {
      alert("Please fill all required fields.");
      return;
    }

    // ===================== COD =====================
    if (selectedMethod === "cod") {
      try {
        await createOrder({
          data: {
            items: [{ productId, quantity }],
            shippingAddress,
            payment: { method: "COD" },
          },
        }).unwrap();

        alert("Order placed successfully!");
        dispatch(resetCheckout());
        router.push("/order-success");
      } catch (err: any) {
        alert(err?.data?.message || "COD Order failed");
      }
      return;
    }

    // ================== Razorpay ===================
    const razorpayLoaded = await loadRazorpayScript();
    if (!razorpayLoaded) {
      alert("Failed to load Razorpay SDK");
      return;
    }

    try {
      console.log("📤 Sending total amount to backend:", total);
      const razorpayOrder = await createRazorpayOrder(total).unwrap();
      console.log("📦 Razorpay Order from backend:", razorpayOrder);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: razorpayOrder.amount, // ✅ correct
        currency: razorpayOrder.currency, // ✅ correct
        name: "Your Store",
        description: product.name,
        order_id: razorpayOrder.orderId, // ✅ FIXED from .order_id to .orderId
        handler: async (response: any) => {
          console.log("✅ Razorpay handler response:", response);
          try {
            await createOrder({
              data: {
                items: [{ productId, quantity }],
                shippingAddress,
                payment: {
                  method: "RAZORPAY",
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                },
              },
            }).unwrap();

            alert("Payment successful & order placed!");
            dispatch(resetCheckout());
            router.push("/order-success");
          } catch (err: any) {
            alert(err?.data?.message || "Order saving failed");
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.mobile,
        },
        theme: { color: "#6366f1" },
      };

      console.log("🧾 Razorpay Checkout Options:", options);
      console.log("✅ Razorpay KEY:", process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID);


      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("❌ Failed to create Razorpay order", error);
      alert("Failed to create Razorpay order");
    }
  };

  if (!product || isLoading) return <p>Loading product...</p>;

  return (
    <div className="max-w-lg mx-auto p-6 text-center">
      <h1 className="text-xl font-bold mb-2">Payment for {product.name}</h1>
      <p>Total Amount: ₹{total.toFixed(2)}</p>

      <div className="text-left mt-4">
        <p className="font-semibold mb-1">Select Payment Method:</p>
        {["card", "upi", "netbanking", "cod"].map((method) => (
          <label key={method} className="block mb-1 cursor-pointer">
            <input
              type="radio"
              name="payment"
              value={method}
              checked={selectedMethod === method}
              onChange={() => handleSelectMethod(method as any)}
            />
            <span className="ml-2 capitalize">
              {method === "cod" ? "Cash on Delivery" : method}
            </span>
          </label>
        ))}
      </div>

      <button
        onClick={handlePayment}
        disabled={!selectedMethod || placingOrder}
        className="mt-4 bg-indigo-600 text-white py-2 px-6 rounded"
      >
        {placingOrder
          ? "Processing..."
          : selectedMethod === "cod"
          ? "Place COD Order"
          : "Pay with Razorpay"}
      </button>
    </div>
  );
};

export default PaymentPage;
