"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useCreateOrderMutation,
  useCreateRazorpayOrderMutation,
  useVerifyOrderAmountMutation,
} from "@/redux/services/user/orderApi";
import { resetCheckout, setPaymentMethod } from "@/redux/slices/checkoutSlice";
import { useRouter } from "next/navigation";
import { useGetCartQuery } from "@/redux/services/user/cartApi";
import { useGetProductByIDQuery } from "@/redux/services/user/publicProductApi";
import { useState, useEffect, useMemo } from "react";

// ✅ IdempotencyKey generator function
const generateIdempotencyKey = () => {
  // You can get userId from auth context if needed
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2);
  return `order_${timestamp}_${random}`;
};

const PaymentPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  // Strictly from Redux!
  const {
    items,
    type,
    selectedAddress: shippingAddress,
  } = useSelector((state: RootState) => state.checkout);

  // Fetch product for direct purchase
  const productId =
    type === "direct_purchase" && items.length ? items[0].productId : null;
  const { data: product, isLoading: loadingProduct } = useGetProductByIDQuery(
    productId || "",
    { skip: !productId }
  );

  // Fetch full cart data for cart purchase
  const { data: cartData, isLoading: cartLoading } = useGetCartQuery(
    undefined,
    { skip: type !== "cart_purchase" }
  );

  // RTK Query hooks
  const [createOrder, { isLoading: placingOrder }] = useCreateOrderMutation();
  const [createRazorpayOrder] = useCreateRazorpayOrderMutation();
  const [verifyOrderAmount, { isLoading: verifying }] =
    useVerifyOrderAmountMutation();

  // Local UI state
  const [selectedMethod, setSelectedMethod] = useState<
    "card" | "upi" | "netbanking" | "cod" | null
  >(null);
  const [serverAmount, setServerAmount] = useState<number | null>(null);
  const [priceVerified, setPriceVerified] = useState(false);

  // ✅ Store idempotencyKey to prevent regeneration on re-renders
  const [currentIdempotencyKey, setCurrentIdempotencyKey] =
    useState<string>("");

  // ✅ Generate idempotencyKey once per payment session
  useEffect(() => {
    if (!currentIdempotencyKey) {
      setCurrentIdempotencyKey(generateIdempotencyKey());
    }
  }, [currentIdempotencyKey]);

  // Calculate displayAmount for rendering
  const displayAmount = useMemo(() => {
    if (type === "direct_purchase" && items.length && product) {
      const item = items[0];
      const variant = product.variants?.find((v) => v._id === item.variantId);
      return variant ? variant.discountedPrice * item.quantity : 0;
    }
    if (type === "cart_purchase" && cartData?.items?.length) {
      return cartData.items.reduce((sum, item) => {
        const variant = item.product.variants.find(
          (v) => v._id === item.variantId
        );
        return sum + (variant ? variant.discountedPrice * item.quantity : 0);
      }, 0);
    }
    return 0;
  }, [type, items, product, cartData]);

  // Prepare orderItems for backend
  const orderItems = useMemo(() => {
    if (type === "direct_purchase" && items.length) {
      return items.map(({ productId, variantId, quantity }) => ({
        productId,
        variantId,
        quantity,
      }));
    }
    if (type === "cart_purchase" && cartData?.items?.length) {
      return cartData.items.map((item) => ({
        productId: item.product._id,
        variantId: item.variantId,
        quantity: item.quantity,
      }));
    }
    return [];
  }, [type, items, cartData]);

  // Background price verification (from backend)
  useEffect(() => {
    const doVerification = async () => {
      if (!orderItems.length) return;
      try {
        const result = await verifyOrderAmount({ items: orderItems }).unwrap();
        setServerAmount(result.totalAmount);
        setPriceVerified(Math.abs(result.totalAmount - displayAmount) < 1);
      } catch {
        setServerAmount(displayAmount);
        setPriceVerified(false);
      }
    };
    doVerification();
  }, [orderItems, displayAmount, verifyOrderAmount]);

  // Reset payment selection every mount
  useEffect(() => {
    dispatch(setPaymentMethod(null));
    setSelectedMethod(null);
  }, [dispatch]);

  // Razorpay loader
  const loadRazorpayScript = () =>
    new Promise<boolean>((resolve) => {
      if (document.getElementById("razorpay-sdk")) return resolve(true);
      const script = document.createElement("script");
      script.id = "razorpay-sdk";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handleSelectMethod = (method: typeof selectedMethod) => {
    setSelectedMethod(method);
    dispatch(setPaymentMethod(method === "cod" ? "COD" : "RAZORPAY"));
  };

  // ✅ Updated Payment handler with IdempotencyKey
  const handlePayment = async () => {
    if (!selectedMethod) return alert("Please select a payment method.");
    if (!shippingAddress) return alert("Please select a shipping address.");
    if (!orderItems.length) return alert("No products to order.");
    if (!currentIdempotencyKey)
      return alert("Payment session expired. Please refresh.");

    const paymentAmount = serverAmount || displayAmount;

    if (
      !priceVerified &&
      serverAmount &&
      Math.abs(serverAmount - displayAmount) > 1
    ) {
      const confirm = window.confirm(
        `Price verification shows ₹${serverAmount.toFixed(
          2
        )} instead of ₹${displayAmount.toFixed(2)}. Continue?`
      );
      if (!confirm) return;
    }

    // ✅ COD Order with IdempotencyKey
    if (selectedMethod === "cod") {
      try {
        const orderData = await createOrder({
          data: {
            items: orderItems,
            shippingAddress,
            payment: { method: "COD" as const },
            fromCart: type === "cart_purchase",
          },
          idempotencyKey: currentIdempotencyKey, // ✅ Pass idempotencyKey
        }).unwrap();

        // ✅ Handle duplicate order response
        if (orderData.isExisting) {
          alert(`Order already exists! Order ID: ${orderData.orderId}`);
          dispatch(resetCheckout());
          router.push(`/order-success?orderId=${orderData.orderId}`);
          return;
        }

        alert("Order placed successfully with Cash on Delivery.");
        dispatch(resetCheckout());
        const orderId = orderData?.orderId || orderData?.data?.orderId;
        router.push(
          orderId ? `/order-success?orderId=${orderId}` : "/order-success"
        );
      } catch (error: any) {
        alert(
          error?.data?.message || "Failed to place Cash on Delivery order."
        );
      }
      return;
    }

    // ✅ Razorpay Order with IdempotencyKey
    const razorpayLoaded = await loadRazorpayScript();
    if (!razorpayLoaded)
      return alert(
        "Failed to load Razorpay payment SDK. Please refresh and try again."
      );

    try {
      const razorpayOrder = await createRazorpayOrder(paymentAmount).unwrap();
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "SUVIDHA Store",
        description:
          orderItems.length > 1
            ? `Order of ${orderItems.length} items`
            : product?.name,
        order_id: razorpayOrder.orderId,
        handler: async (response: any) => {
          try {
            const orderData = await createOrder({
              data: {
                items: orderItems,
                shippingAddress,
                payment: {
                  method: "RAZORPAY" as const,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                },
                fromCart: type === "cart_purchase",
              },
              idempotencyKey: currentIdempotencyKey, // ✅ Pass idempotencyKey
            }).unwrap();

            // ✅ Handle duplicate order response
            if (orderData.isExisting) {
              alert(`Order already processed! Order ID: ${orderData.orderId}`);
              dispatch(resetCheckout());
              router.push(`/order-success?orderId=${orderData.orderId}`);
              return;
            }

            alert("Payment successful and order placed!");
            dispatch(resetCheckout());
            const orderId = orderData?.orderId || orderData?.data?.orderId;
            router.push(
              orderId ? `/order-success?orderId=${orderId}` : "/order-success"
            );
          } catch (e: any) {
            alert(e?.data?.message || "Failed to record order after payment.");
          }
        },
        prefill: {
          name: shippingAddress.fullName,
          contact: shippingAddress.mobile,
        },
        theme: { color: "#6366f1" },
        modal: {
          ondismiss: () => console.log("Payment cancelled by user"),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) =>
        alert(
          `Payment failed: ${response.error.description || "Please try again"}`
        )
      );
      rzp.open();
    } catch (error: any) {
      alert(
        error?.data?.message ||
          "Failed to initiate Razorpay payment. Please try again."
      );
    }
  };

  if (
    (type === "direct_purchase" && loadingProduct) ||
    (type === "cart_purchase" && cartLoading)
  )
    return (
      <p className="text-center mt-10">Loading product and cart details...</p>
    );

  if (!orderItems.length) {
    return (
      <div className="text-center mt-10 p-6">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold mb-4">No Items for Payment</h2>
        <p className="text-gray-600 mb-6">
          Please select a product variant or add items to cart.
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => router.push("/cart")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Go to Cart
          </button>
          <button
            onClick={() => router.push("/products")}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition"
          >
            Browse Products
          </button>
        </div>
      </div>
    );
  }

  // ----------- Render
  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border">
        <div className="p-6 border-b text-center">
          <h1 className="text-2xl font-bold mb-2">Complete Payment</h1>
          <p className="text-gray-600 mb-2">
            {orderItems.length === 1
              ? product?.name
              : `${orderItems.length} products`}
          </p>
          <p className="text-3xl font-bold text-blue-600">
            ₹{displayAmount.toFixed(2)}
          </p>

          {/* ✅ Show IdempotencyKey for debugging (remove in production) */}
          {process.env.NODE_ENV === "development" && (
            <p className="text-xs text-gray-400 mt-1">
              Session: {currentIdempotencyKey.slice(-8)}
            </p>
          )}

          <div className="mt-2 text-sm">
            {verifying && (
              <p className="text-blue-500 flex items-center justify-center gap-1">
                <span className="animate-spin rounded-full h-3 w-3 border border-blue-500 border-t-transparent"></span>
                Verifying price...
              </p>
            )}
            {!verifying && priceVerified && (
              <p className="text-green-600">✅ Price verified</p>
            )}
            {!verifying && !priceVerified && serverAmount && (
              <p className="text-orange-600">⚠️ Price mismatch detected</p>
            )}
            {!verifying &&
              serverAmount &&
              Math.abs(serverAmount - displayAmount) > 1 && (
                <p className="text-orange-500">
                  Server shows: ₹{serverAmount.toFixed(2)}
                </p>
              )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6">
          <h3 className="font-semibold mb-4">Select Payment Method</h3>
          <div className="space-y-3">
            {[
              { key: "card", label: "Credit/Debit Card", icon: "💳" },
              { key: "upi", label: "UPI", icon: "📱" },
              { key: "netbanking", label: "Net Banking", icon: "🏦" },
              { key: "cod", label: "Cash on Delivery", icon: "💵" },
            ].map((method) => (
              <label
                key={method.key}
                className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                  selectedMethod === method.key
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value={method.key}
                  checked={selectedMethod === method.key}
                  onChange={() => handleSelectMethod(method.key as any)}
                  className="sr-only"
                />
                <span className="text-2xl mr-3">{method.icon}</span>
                <span className="font-medium">{method.label}</span>
                {selectedMethod === method.key && (
                  <span className="ml-auto text-blue-500">✓</span>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="p-6 border-t">
          <button
            onClick={handlePayment}
            disabled={!selectedMethod || placingOrder || !currentIdempotencyKey}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
              !selectedMethod || placingOrder || !currentIdempotencyKey
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : selectedMethod === "cod"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {placingOrder
              ? "Processing..."
              : selectedMethod === "cod"
              ? `Place COD Order - ₹${(serverAmount || displayAmount).toFixed(
                  2
                )}`
              : `Pay ₹${(serverAmount || displayAmount).toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
