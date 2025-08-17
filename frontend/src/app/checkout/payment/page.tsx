"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useCreateOrderMutation,
  useCreateRazorpayOrderMutation,
  useVerifyOrderAmountMutation, // ✅ Add this import
} from "@/redux/services/user/orderApi";
import { resetCheckout, setPaymentMethod } from "@/redux/slices/checkoutSlice";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetCartQuery } from "@/redux/services/user/cartApi";
import { useGetProductByIDQuery } from "@/redux/services/user/publicProductApi";
import { useState, useEffect, useMemo } from "react";

type PlaceOrderItem = {
  productId: string;
  variantId: string;
  quantity: number;
};

const PaymentPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get data from URL parameters
  const urlProductId = searchParams.get("product");
  const urlVariantId = searchParams.get("variant");
  const urlQuantity = searchParams.get("quantity");

  // Redux state selectors
  const {
    productId: reduxProductId,
    quantity: reduxQuantity,
    selectedAddress: shippingAddress,
  } = useSelector((state: RootState) => state.checkout);

  // Use URL params first, then Redux fallback
  const actualProductId = urlProductId || reduxProductId;
  const actualVariantId = urlVariantId;
  const actualQuantity = urlQuantity ? parseInt(urlQuantity) : reduxQuantity;

  // Fetch data
  const { data: cartData } = useGetCartQuery();
  const { data: product, isLoading: loadingProduct } = useGetProductByIDQuery(
    actualProductId || "",
    { skip: !actualProductId }
  );
  const cartBased = !actualProductId && cartData && cartData.items.length > 0;

  // Local state
  const [selectedMethod, setSelectedMethod] = useState<
    "card" | "upi" | "netbanking" | "cod" | null
  >(null);
  const [serverAmount, setServerAmount] = useState<number | null>(null);
  const [priceVerified, setPriceVerified] = useState(false);

  // ✅ RTK Query mutation hooks
  const [createOrder, { isLoading: placingOrder }] = useCreateOrderMutation();
  const [createRazorpayOrder] = useCreateRazorpayOrderMutation();
  const [verifyOrderAmount, { isLoading: verifying }] = useVerifyOrderAmountMutation(); // ✅ Add this

  // ✅ INDUSTRY STANDARD: Calculate display amount immediately
  const { items, displayAmount } = useMemo(() => {
    let orderItems: PlaceOrderItem[] = [];
    let amount = 0;

    if (actualProductId && product && actualVariantId) {
      const variant = product.variants?.find((v) => v._id === actualVariantId);
      if (variant) {
        orderItems = [
          {
            productId: actualProductId,
            variantId: actualVariantId,
            quantity: actualQuantity,
          },
        ];
        amount = variant.discountedPrice * actualQuantity;
      }
    } else if (cartData && cartData.items.length > 0) {
      orderItems = cartData.items.map((item) => ({
        productId: item.product._id,
        variantId: item.variantId,
        quantity: item.quantity,
      }));
      amount = cartData.cartTotal || 0;
    }

    return { items: orderItems, displayAmount: amount };
  }, [actualProductId, product, actualVariantId, actualQuantity, cartData]);

  // ✅ RTK QUERY VERIFICATION: Proper API integration
  useEffect(() => {
    const doVerification = async () => {
      if (items.length === 0) return;

      try {
        const result = await verifyOrderAmount({ items }).unwrap();
        
        setServerAmount(result.totalAmount);
        
        // Check if amounts match (allow small rounding differences)
        const matches = Math.abs(result.totalAmount - displayAmount) < 1;
        setPriceVerified(matches);

        if (matches) {
          console.log('✅ Price verification successful');
        } else {
          console.warn(`Price mismatch: Display=${displayAmount}, Server=${result.totalAmount}`);
        }

      } catch (error: any) {
        console.error("Price verification failed:", error);
        // Fallback - allow user to continue but with warning
        setServerAmount(displayAmount);
        setPriceVerified(false);
      }
    };

    doVerification();
  }, [items, displayAmount, verifyOrderAmount]);

  // Clear payment method selection on mount
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

  const handleSelectMethod = (method: typeof selectedMethod) => {
    setSelectedMethod(method);
    dispatch(setPaymentMethod(method === "cod" ? "COD" : "RAZORPAY"));
  };

  // ✅ SECURE PAYMENT: Use verified amount
  const handlePayment = async () => {
    if (!selectedMethod) {
      alert("Please select a payment method.");
      return;
    }
    if (!shippingAddress) {
      alert("Please select a shipping address.");
      return;
    }
    if (items.length === 0) {
      alert("No products to order.");
      return;
    }

    // Use server-verified amount if available, otherwise display amount
    const paymentAmount = serverAmount || displayAmount;

    // Warn user if price wasn't verified
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

    console.log("Order payload:", {
      items,
      shippingAddress,
      selectedMethod,
      paymentAmount,
      priceVerified,
    });

    // Handle COD flow
    if (selectedMethod === "cod") {
      try {
        const orderData = await createOrder({
          data: {
            items,
            shippingAddress,
            payment: { method: "COD" as const },
            fromCart: cartBased,
          },
        }).unwrap();

        alert("Order placed successfully with Cash on Delivery.");
        dispatch(resetCheckout());

        const orderId = orderData?.data?.orderId || orderData?.orderId;
        router.push(
          orderId ? `/order-success?orderId=${orderId}` : "/order-success"
        );
      } catch (error: any) {
        console.error("COD Error:", error);
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
      // Use verified amount for Razorpay
      const razorpayOrder = await createRazorpayOrder(paymentAmount).unwrap();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "SUVIDHA Store",
        description:
          items.length > 1 ? `Order of ${items.length} items` : product?.name,
        order_id: razorpayOrder.orderId,
        handler: async (response: any) => {
          try {
            const orderData = await createOrder({
              data: {
                items,
                shippingAddress,
                payment: {
                  method: "RAZORPAY" as const,
                  razorpayOrderId: response.razorpay_order_id,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                },
                fromCart: cartBased,
              },
            }).unwrap();

            alert("Payment successful and order placed!");
            dispatch(resetCheckout());

            const orderId = orderData?.data?.orderId || orderData?.orderId;
            router.push(
              orderId ? `/order-success?orderId=${orderId}` : "/order-success"
            );
          } catch (e: any) {
            console.error("Order creation error:", e);
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
        modal: {
          ondismiss: () => {
            console.log("Payment cancelled by user");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on("payment.failed", (response: any) => {
        console.error("Payment failed:", response.error);
        alert(
          `Payment failed: ${response.error.description || "Please try again"}`
        );
      });

      rzp.open();
    } catch (error: any) {
      console.error("Razorpay error:", error);
      alert(
        error?.data?.message ||
          "Failed to initiate Razorpay payment. Please try again."
      );
    }
  };

  if (actualProductId && loadingProduct)
    return <p className="text-center mt-10">Loading product details...</p>;

  if (items.length === 0) {
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

  return (
    <div className="max-w-lg mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg border">
        {/* Header */}
        <div className="p-6 border-b text-center">
          <h1 className="text-2xl font-bold mb-2">Complete Payment</h1>
          <p className="text-gray-600 mb-2">
            {items.length === 1 ? product?.name : `${items.length} products`}
          </p>

          {/* ✅ SHOW PRICE IMMEDIATELY - like Myntra/Flipkart */}
          <p className="text-3xl font-bold text-blue-600">
            ₹{displayAmount.toFixed(2)}
          </p>

          {/* ✅ Enhanced verification status indicators */}
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
            
            {!verifying && serverAmount && Math.abs(serverAmount - displayAmount) > 1 && (
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
            disabled={!selectedMethod || placingOrder}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-lg transition-colors ${
              !selectedMethod || placingOrder
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : selectedMethod === "cod"
                ? "bg-green-600 hover:bg-green-700 text-white"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {placingOrder
              ? "Processing..."
              : selectedMethod === "cod"
              ? `Place COD Order - ₹${(serverAmount || displayAmount).toFixed(2)}`
              : `Pay ₹${(serverAmount || displayAmount).toFixed(2)}`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
