"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useCreateOrderMutation,
  useCreateRazorpayOrderMutation,
  useVerifyOrderAmountMutation,
} from "@/redux/services/user/orderApi";
import { resetCheckout } from "@/redux/slices/checkoutSlice";
import { useRouter } from "next/navigation";
import { useGetCartQuery } from "@/redux/services/user/cartApi";
import { useGetProductByIDQuery } from "@/redux/services/user/publicProductApi";
import { useState, useEffect, useMemo } from "react";

// ✅ IdempotencyKey generator function
const generateIdempotencyKey = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2);
  return `order_${timestamp}_${random}`;
};

const PaymentPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  // ✅ ALL HOOKS AT TOP LEVEL
  const {
    items,
    type,
    selectedAddress: shippingAddress,
  } = useSelector((state: RootState) => state.checkout);

  const productId =
    type === "direct_purchase" && items.length ? items[0].productId : null;

  const { data: product, isLoading: loadingProduct } = useGetProductByIDQuery(
    productId || "",
    { skip: !productId }
  );

  const { data: cartData, isLoading: cartLoading } = useGetCartQuery(
    undefined,
    { skip: type !== "cart_purchase" }
  );

  const [createOrder, { isLoading: placingOrder }] = useCreateOrderMutation();
  const [createRazorpayOrder] = useCreateRazorpayOrderMutation();
  const [verifyOrderAmount, { isLoading: verifying }] =
    useVerifyOrderAmountMutation();

  // ✅ Enhanced local state for fees
  const [selectedMethod, setSelectedMethod] = useState<
    "ONLINE" | "ADVANCE" | "COD" | null
  >(null);
  const [currentIdempotencyKey, setCurrentIdempotencyKey] = useState<string>("");
  const [feeBreakdown, setFeeBreakdown] = useState({
    subtotal: 0,
    packagingFee: 29,
    deliveryCharge: 0, // Will be calculated
    codHandlingFee: 0,
    advanceAmount: 0,
    remainingAmount: 0,
    totalAmount: 0,
    isEligibleForAdvance: false
  });

  // ✅ Generate idempotencyKey once per payment session
  useEffect(() => {
    if (!currentIdempotencyKey) {
      setCurrentIdempotencyKey(generateIdempotencyKey());
    }
  }, [currentIdempotencyKey]);

  // ✅ Calculate base subtotal
  const subtotal = useMemo(() => {
    if (type === "direct_purchase" && items.length && product) {
      const item = items[0];
      const variant = product.variants?.find((v) => v._id === item.variantId);
      if (!variant) return 0;
      const price = variant.hasDiscount
        ? variant.discountedPrice
        : variant.price;
      return (price || 0) * item.quantity;
    }
    if (type === "cart_purchase" && cartData?.items?.length) {
      return cartData.items.reduce((sum, item) => {
        const variant = item.product.variants.find(
          (v) => v._id === item.variantId
        );
        if (!variant) return sum;
        const price = variant.hasDiscount
          ? variant.discountedPrice
          : variant.price;
        return sum + (price || 0) * item.quantity;
      }, 0);
    }
    return 0;
  }, [type, items, product, cartData]);

  // ✅ Prepare orderItems for backend
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

  // ✅ Calculate fees based on selected payment method
  useEffect(() => {
    if (!subtotal) return;

    const isEligibleForAdvance = subtotal >= 15000; // ₹15,000+ for advance
    const codFee = selectedMethod === "COD" ? 99 : 0;
    const advanceAmount = selectedMethod === "ADVANCE" ? Math.round(subtotal * 0.1) : 0;
    const remainingAmount = selectedMethod === "ADVANCE" ? subtotal - advanceAmount : 0;
    
    // Delivery charge would come from backend API (placeholder for now)
    const deliveryCharge = 50; // This should come from backend based on address

    let totalAmount = 0;
    if (selectedMethod === "ONLINE") {
      totalAmount = subtotal + feeBreakdown.packagingFee + deliveryCharge;
    } else if (selectedMethod === "ADVANCE") {
      totalAmount = advanceAmount + feeBreakdown.packagingFee + deliveryCharge;
    } else if (selectedMethod === "COD") {
      totalAmount = subtotal + feeBreakdown.packagingFee + deliveryCharge + codFee;
    }

    setFeeBreakdown({
      subtotal,
      packagingFee: 29,
      deliveryCharge,
      codHandlingFee: codFee,
      advanceAmount,
      remainingAmount,
      totalAmount,
      isEligibleForAdvance
    });
  }, [subtotal, selectedMethod]);

  // ✅ Razorpay loader
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

  // ✅ MAIN Payment Handler
  const handlePayment = async () => {
    if (!selectedMethod) return alert("Please select a payment method.");
    if (!shippingAddress) return alert("Please select a shipping address.");
    if (!orderItems.length) return alert("No products to order.");
    if (!currentIdempotencyKey) return alert("Payment session expired. Please refresh.");

    // ✅ Handle COD Order
    if (selectedMethod === "COD") {
      try {
        const orderData = await createOrder({
          data: {
            items: orderItems,
            shippingAddress,
            payment: { method: "COD" as const },
            fromCart: type === "cart_purchase",
          },
          idempotencyKey: currentIdempotencyKey,
        }).unwrap();

        if (orderData.isExisting) {
          alert(`Order already exists! Order ID: ${orderData.orderId}`);
          dispatch(resetCheckout());
          router.push(`/order-success?orderId=${orderData.orderId}`);
          return;
        }

        alert("COD Order placed successfully!");
        dispatch(resetCheckout());
        const orderId = orderData?.orderId || orderData?.data?.orderId;
        router.push(orderId ? `/order-success?orderId=${orderId}` : "/order-success");
      } catch (error: any) {
        alert(error?.data?.message || "Failed to place COD order.");
      }
      return;
    }

    // ✅ Handle Online/Advance Payment (Both use Razorpay)
    if (selectedMethod === "ONLINE" || selectedMethod === "ADVANCE") {
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        return alert("Failed to load payment system. Please refresh and try again.");
      }

      try {
        const paymentAmount = feeBreakdown.totalAmount;
        const razorpayOrder = await createRazorpayOrder(paymentAmount).unwrap();
        
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
          amount: razorpayOrder.amount,
          currency: razorpayOrder.currency,
          name: "SUVIDHA Store",
          description: selectedMethod === "ADVANCE" 
            ? `Advance Payment (10%) - ${orderItems.length} items`
            : `Online Payment - ${orderItems.length} items`,
          order_id: razorpayOrder.orderId,

          // ✅ Payment success handler
          handler: async (response: any) => {
            try {
              const orderData = await createOrder({
                data: {
                  items: orderItems,
                  shippingAddress,
                  payment: {
                    method: "RAZORPAY" as const,
                    isAdvance: selectedMethod === "ADVANCE", // ✅ Important flag
                    razorpayOrderId: response.razorpay_order_id,
                    razorpayPaymentId: response.razorpay_payment_id,
                    razorpaySignature: response.razorpay_signature,
                  },
                  fromCart: type === "cart_purchase",
                },
                idempotencyKey: currentIdempotencyKey,
              }).unwrap();

              if (orderData.isExisting) {
                alert(`Order already processed! Order ID: ${orderData.orderId}`);
                dispatch(resetCheckout());
                router.push(`/order-success?orderId=${orderData.orderId}`);
                return;
              }

              const successMessage = selectedMethod === "ADVANCE"
                ? `Advance payment successful! Remaining ₹${feeBreakdown.remainingAmount} will be collected on delivery.`
                : "Payment successful and order placed!";
              
              alert(successMessage);
              dispatch(resetCheckout());
              const orderId = orderData?.orderId || orderData?.data?.orderId;
              router.push(orderId ? `/order-success?orderId=${orderId}` : "/order-success");
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
          alert(`Payment failed: ${response.error.description || "Please try again"}`)
        );
        rzp.open();
      } catch (error: any) {
        alert(error?.data?.message || "Failed to initiate payment. Please try again.");
      }
    }
  };

  // ✅ LOADING STATES
  if ((type === "direct_purchase" && loadingProduct) || (type === "cart_purchase" && cartLoading)) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  // ✅ NO ITEMS ERROR
  if (!orderItems.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Items for Payment</h2>
          <p className="text-gray-600 mb-6">Please add items to cart or select a product.</p>
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
      </div>
    );
  }

  // ✅ MAIN PAYMENT UI
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          {/* ✅ Payment Header */}
          <div className="p-6 border-b border-gray-200 text-center">
            <h1 className="text-2xl font-bold mb-2 text-gray-800">Choose Payment Method</h1>
            <p className="text-gray-600 mb-4">
              {orderItems.length === 1 ? product?.name || "Product" : `${orderItems.length} products`}
            </p>
           
          </div>

          {/* ✅ Payment Options */}
          <div className="p-6">
            <div className="space-y-4">
              {/* ✅ Online Payment (Full Amount) */}
              <label
                className={`block p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedMethod === "ONLINE"
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="ONLINE"
                  checked={selectedMethod === "ONLINE"}
                  onChange={() => setSelectedMethod("ONLINE")}
                  className="sr-only"
                />
                <div className="flex items-start">
                  <span className="text-3xl mr-4">💳</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-800">Pay Online (Full Amount)</h4>
                        <p className="text-sm text-gray-600 mt-1">Credit Card • UPI • Net Banking</p>
                        <p className="text-xs text-green-600 mt-1">✅ Secure & No extra charges</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">
                          ₹{(subtotal + 29 + 50).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">Pay now</div>
                      </div>
                    </div>
                  </div>
                  {selectedMethod === "ONLINE" && (
                    <span className="text-blue-500 text-xl ml-2">✓</span>
                  )}
                </div>
              </label>

              {/* ✅ Advance Payment (10%) - Only show for eligible orders */}
              {feeBreakdown.isEligibleForAdvance && (
                <label
                  className={`block p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                    selectedMethod === "ADVANCE"
                      ? "border-green-500 bg-green-50 shadow-md"
                      : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment_method"
                    value="ADVANCE"
                    checked={selectedMethod === "ADVANCE"}
                    onChange={() => setSelectedMethod("ADVANCE")}
                    className="sr-only"
                  />
                  <div className="flex items-start">
                    <span className="text-3xl mr-4">⚡</span>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="font-semibold text-gray-800">10% Advance Payment</h4>
                          <p className="text-sm text-gray-600 mt-1">Pay 10% now, rest on delivery</p>
                          <p className="text-xs text-green-600 mt-1">✅ Secure & 💰 Save ₹99 COD fee!</p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">
                            ₹{Math.round(subtotal * 0.1) + 29 + 50}
                          </div>
                          <div className="text-xs text-gray-500">Pay now</div>
                          <div className="text-xs text-orange-600 mt-1">
                            + ₹{subtotal - Math.round(subtotal * 0.1)} on delivery
                          </div>
                        </div>
                      </div>
                    </div>
                    {selectedMethod === "ADVANCE" && (
                      <span className="text-green-500 text-xl ml-2">✓</span>
                    )}
                  </div>
                </label>
              )}

              {/* ✅ Cash on Delivery */}
              <label
                className={`block p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedMethod === "COD"
                    ? "border-orange-500 bg-orange-50 shadow-md"
                    : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="COD"
                  checked={selectedMethod === "COD"}
                  onChange={() => setSelectedMethod("COD")}
                  className="sr-only"
                />
                <div className="flex items-start">
                  <span className="text-3xl mr-4">💵</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-800">Cash on Delivery</h4>
                        <p className="text-sm text-gray-600 mt-1">Pay when order arrives</p>
                        <p className="text-xs text-orange-600 mt-1">+ ₹99 handling fee</p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-orange-600">
                          ₹{(subtotal + 29 + 50 + 99).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">Pay on delivery</div>
                      </div>
                    </div>
                  </div>
                  {selectedMethod === "COD" && (
                    <span className="text-orange-500 text-xl ml-2">✓</span>
                  )}
                </div>
              </label>
            </div>

            {/* ✅ Fee Breakdown for Selected Method */}
            {selectedMethod && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-semibold text-gray-800 mb-3">Price Breakdown:</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Product Total:</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Packaging Fee:</span>
                    <span>₹29.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charges:</span>
                    <span>₹50.00</span>
                  </div>
                  {selectedMethod === "COD" && (
                    <div className="flex justify-between text-orange-600">
                      <span>COD Handling Fee:</span>
                      <span>₹99.00</span>
                    </div>
                  )}
                  {selectedMethod === "ADVANCE" && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span>Advance (10%):</span>
                        <span>₹{Math.round(subtotal * 0.1).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Remaining on delivery:</span>
                        <span>₹{(subtotal - Math.round(subtotal * 0.1)).toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total to Pay {selectedMethod === "ADVANCE" ? "Now" : ""}:</span>
                    <span className="text-green-600">₹{feeBreakdown.totalAmount.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ✅ Action Button */}
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={handlePayment}
              disabled={!selectedMethod || placingOrder}
              className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all duration-200 ${
                !selectedMethod || placingOrder
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : selectedMethod === "COD"
                  ? "bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
                  : selectedMethod === "ADVANCE"
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              }`}
            >
              {placingOrder ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : selectedMethod === "COD" ? (
                `Place COD Order`
              ) : selectedMethod === "ADVANCE" ? (
                `Pay Advance ₹${feeBreakdown.totalAmount.toFixed(2)}`
              ) : selectedMethod === "ONLINE" ? (
                `Pay ₹${feeBreakdown.totalAmount.toFixed(2)}`
              ) : (
                "Select Payment Method"
              )}
            </button>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                🔒 Your payment information is secure and encrypted
              </p>
              {!feeBreakdown.isEligibleForAdvance && (
                <p className="text-xs text-gray-400 mt-2">
                  💡 Advance payment available for orders ₹15,000+
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
