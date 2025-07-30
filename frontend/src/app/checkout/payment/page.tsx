"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useCreateOrderMutation,
  useCreateRazorpayOrderMutation,
} from "@/redux/services/user/orderApi";
import { resetCheckout, setPaymentMethod } from "@/redux/slices/checkoutSlice";
import { useRouter } from "next/navigation";
import { useGetCartQuery } from "@/redux/services/user/cartApi";
import { useGetProductByIDQuery } from "@/redux/services/user/publicProductApi";
import { useState, useEffect } from "react";

type PlaceOrderItem = {
  productId: string;
  quantity: number;
};

const PaymentPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  // Redux state selectors
  const {
    productId,
    quantity,
    selectedAddress: shippingAddress,
    paymentMethod,
  } = useSelector((state: RootState) => state.checkout);

  // Fetch data
  const { data: cartData } = useGetCartQuery();
  const { data: product, isLoading: loadingProduct } = useGetProductByIDQuery(
    productId || "",
    {
      skip: !productId,
    }
  );

  // Local state
  const [selectedMethod, setSelectedMethod] = useState<
    "card" | "upi" | "netbanking" | "cod" | null
  >(null);

  // RTK Query mutation hooks
  const [createOrder, { isLoading: placingOrder }] = useCreateOrderMutation();
  const [createRazorpayOrder] = useCreateRazorpayOrderMutation();

  // Prepare order items array and total amount dynamically
  let items: PlaceOrderItem[] = [];
  let totalAmount = 0;

  if (productId && product) {
    items = [{ productId, quantity }];
    totalAmount = product.price * quantity;
  } else if (cartData && cartData.items.length > 0) {
    items = cartData.items.map((item) => ({
      productId: item.product._id,
      quantity: item.quantity,
    }));
    totalAmount = cartData.cartTotal || 0;
  }

  // Clear payment method selection and local state on mount
  useEffect(() => {
    dispatch(setPaymentMethod(null));
    setSelectedMethod(null);
  }, [dispatch]);

  // Razorpay SDK loader
  const loadRazorpayScript = () =>
    new Promise<boolean>((resolve) => {
      if (document.getElementById("razorpay-sdk")) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // Payment method selector handler
  const handleSelectMethod = (method: typeof selectedMethod) => {
    setSelectedMethod(method);
    dispatch(setPaymentMethod(method === "cod" ? "COD" : "RAZORPAY"));
  };

  // Payment handler
  const handlePayment = async () => {
    if (!selectedMethod) {
      alert("Please select a payment method.");
      return;
    }
    if (!shippingAddress) {
      alert("Please select a shipping address.");
      return;
    }
    if (!paymentMethod) {
      alert("Invalid payment method.");
      return;
    }
    if (items.length === 0) {
      alert("No products to order.");
      return;
    }

    // Handle COD flow
    if (selectedMethod === "cod") {
      try {
        await createOrder({
          data: {
            items,
            shippingAddress,
            payment: { method: "COD" },
          },
        }).unwrap();

        alert("Order placed successfully with Cash on Delivery.");
        dispatch(resetCheckout());
        router.push("/order-success");
      } catch (error: any) {
        alert(
          error?.data?.message || "Failed to place Cash on Delivery order."
        );
      }
      return;
    }

    // Handle Razorpay flow
    const razorpayLoaded = await loadRazorpayScript();
    if (!razorpayLoaded) {
      alert(
        "Failed to load Razorpay payment SDK. Please refresh and try again."
      );
      return;
    }

    try {
      const razorpayOrder = await createRazorpayOrder(totalAmount).unwrap();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: razorpayOrder.amount, // amount in paise
        currency: razorpayOrder.currency,
        name: "Your Store",
        description:
          items.length > 1 ? `Order of ${items.length} items` : product?.name,
        order_id: razorpayOrder.orderId,
        handler: async (response: any) => {
          try {
            await createOrder({
              data: {
                items,
                shippingAddress,
                payment: {
                  method: "RAZORPAY",
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                },
              },
            }).unwrap();

            alert("Payment successful and order placed!");
            dispatch(resetCheckout());
            router.push("/order-success");
          } catch (e: any) {
            alert(e?.data?.message || "Failed to record order after payment.");
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.mobile,
        },
        theme: {
          color: "#6366f1",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error(
        "Error during Razorpay order creation or opening checkout:",
        error
      );
      alert("Failed to initiate Razorpay payment. Please try again.");
    }
  };

  if (productId && loadingProduct)
    return <p className="text-center mt-10">Loading product details...</p>;

  return (
    <div className="max-w-lg mx-auto p-6 text-center">
      <h1 className="text-xl font-bold mb-2">
        Pay for{" "}
        {items.length === 1 ? product?.name : `${items.length} products`}
      </h1>
      <p>Total Amount: ₹{totalAmount.toFixed(2)}</p>

      <div className="text-left mt-4">
        <p className="font-semibold mb-2">Select Payment Method</p>
        {["card", "upi", "netbanking", "cod"].map((method) => (
          <label key={method} className="block cursor-pointer mb-1">
            <input
              type="radio"
              name="payment_method"
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
        className="mt-4 bg-indigo-600 text-white py-2 px-6 rounded disabled:opacity-50"
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
