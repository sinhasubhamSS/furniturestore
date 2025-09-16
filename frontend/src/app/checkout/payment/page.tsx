"use client";

import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useCreateOrderMutation,
  useCreateRazorpayOrderMutation,
  useGetCheckoutPricingMutation,
} from "@/redux/services/user/orderApi";
import { resetCheckout } from "@/redux/slices/checkoutSlice";
import { useRouter } from "next/navigation";
import { useGetCartQuery } from "@/redux/services/user/cartApi";
import { useGetProductByIDQuery } from "@/redux/services/user/publicProductApi";
import { useState, useEffect, useMemo } from "react";
// ✅ UPDATED: Use existing types
import { OrderCreationResponse, PaymentMethod } from "@/types/order";

// ✅ CLEAN: Only essential env config
const APP_CONFIG = {
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_key",
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || "SUVIDHA Store",
  currency: process.env.NEXT_PUBLIC_CURRENCY || "INR",
};

const generateIdempotencyKey = () => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).slice(2);
  return `order_${timestamp}_${random}`;
};

// ✅ SAFE HELPER FUNCTIONS
const safeToFixed = (value: any, digits: number = 2): string => {
  if (typeof value === "number" && !isNaN(value)) {
    return value.toFixed(digits);
  }
  return (0).toFixed(digits);
};

const safeNumber = (value: any): number => {
  if (typeof value === "number" && !isNaN(value)) {
    return value;
  }
  return 0;
};

const PaymentPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

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
  const [getCheckoutPricing] = useGetCheckoutPricingMutation();

  // ✅ UPDATED: Use PaymentMethod type
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [currentIdempotencyKey, setCurrentIdempotencyKey] = useState<string>("");
  const [pricingData, setPricingData] = useState<any>(null);
  const [loadingPricing, setLoadingPricing] = useState(false);

  useEffect(() => {
    if (!currentIdempotencyKey) {
      setCurrentIdempotencyKey(generateIdempotencyKey());
    }
  }, [currentIdempotencyKey]);

  // ✅ SAFE SUBTOTAL CALCULATION
  const subtotal = useMemo(() => {
    if (type === "direct_purchase" && items.length && product) {
      const item = items[0];
      const variant = product.variants?.find((v) => v._id === item.variantId);
      if (!variant) return 0;
      const price = variant.hasDiscount
        ? safeNumber(variant.discountedPrice)
        : safeNumber(variant.price);
      return price * safeNumber(item.quantity);
    }
    if (type === "cart_purchase" && cartData?.items?.length) {
      return cartData.items.reduce((sum, item) => {
        const variant = item.product?.variants.find(
          (v) => v._id === item.variantId
        );
        if (!variant) return sum;
        const price = variant.hasDiscount
          ? safeNumber(variant.discountedPrice)
          : safeNumber(variant.price);
        return sum + price * safeNumber(item.quantity);
      }, 0);
    }
    return 0;
  }, [type, items, product, cartData]);

  // ✅ UPDATED: Better typed orderItems
  const orderItems = useMemo((): Array<{
    productId: string;
    variantId: string;
    quantity: number;
  }> => {
    if (type === "direct_purchase" && items.length) {
      return [
        {
          productId: items[0].productId,
          variantId: items[0].variantId || "",
          quantity: items[0].quantity,
        },
      ];
    }
    if (type === "cart_purchase" && cartData?.items?.length) {
      return cartData.items.map((item) => ({
        productId: item.product?._id || "",
        variantId: item.variantId || "",
        quantity: item.quantity,
      }));
    }
    return [];
  }, [type, items, cartData]);

  // ✅ BACKEND-DRIVEN: Fetch complete pricing
  useEffect(() => {
    if (!shippingAddress?.pincode || !orderItems.length) return;

    const fetchPricing = async () => {
      setLoadingPricing(true);
      try {
        const response = await getCheckoutPricing({
          items: orderItems,
          pincode: shippingAddress.pincode,
        }).unwrap();

        const safePricingData = {
          subtotal: safeNumber(response.subtotal),
          packagingFee: safeNumber(response.packagingFee),
          deliveryCharge: safeNumber(response.deliveryCharge),
          codHandlingFee: safeNumber(response.codHandlingFee),
          advanceEligible: Boolean(response.advanceEligible),
          advanceAmount: safeNumber(response.advanceAmount),
          remainingAmount: safeNumber(response.remainingAmount),
          advancePercentage: safeNumber(response.advancePercentage || 10),
          checkoutTotal: safeNumber(response.checkoutTotal),
          codTotal: safeNumber(response.codTotal),
          deliveryInfo: response.deliveryInfo || null,
        };

        setPricingData(safePricingData);
        console.log("💰 [PAYMENT] Backend pricing:", safePricingData);
      } catch (error: any) {
        console.error("❌ [PAYMENT] Pricing fetch failed:", error);
        const errorMessage = error?.data?.message || error?.message || "Failed to load pricing";
        alert(`${errorMessage}. Please refresh the page.`);
      } finally {
        setLoadingPricing(false);
      }
    };

    fetchPricing();
  }, [shippingAddress?.pincode, orderItems, getCheckoutPricing]);

  // ✅ BACKEND-DRIVEN CALCULATIONS
  const calculateTotalAmount = useMemo(() => {
    if (!pricingData) return 0;

    const subtotalSafe = safeNumber(pricingData.subtotal);
    const packagingFeeSafe = safeNumber(pricingData.packagingFee);
    const deliveryChargeSafe = safeNumber(pricingData.deliveryCharge);
    const baseAmount = subtotalSafe + packagingFeeSafe + deliveryChargeSafe;

    switch (selectedMethod) {
      case "RAZORPAY":
        return baseAmount;
      case "ADVANCE":
        const advanceAmountSafe = safeNumber(pricingData.advanceAmount);
        return advanceAmountSafe + packagingFeeSafe + deliveryChargeSafe;
      case "COD":
        const codFeeSafe = safeNumber(pricingData.codHandlingFee);
        return baseAmount + codFeeSafe;
      default:
        return baseAmount;
    }
  }, [pricingData, selectedMethod]);

  const isAdvanceEligible = useMemo(() => {
    return Boolean(pricingData?.advanceEligible);
  }, [pricingData]);

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

  // ✅ ENHANCED: Better success redirect
  const redirectToSuccess = (orderData: OrderCreationResponse) => {
    const orderId = orderData?.orderId || orderData?.data?.orderId;
    
    if (orderId) {
      console.log("✅ Redirecting to success page with orderId:", orderId);
      router.push(`/order-success?orderId=${orderId}&status=success`);
    } else {
      console.error("⚠️ Order ID missing in response:", orderData);
      router.push("/order-success?status=success");
    }
  };

  const handlePayment = async () => {
    if (!selectedMethod) return alert("Please select a payment method.");
    if (!shippingAddress) return alert("Please select a shipping address.");
    if (!orderItems.length) return alert("No products to order.");
    if (!currentIdempotencyKey)
      return alert("Payment session expired. Please refresh.");
    if (!pricingData)
      return alert("Pricing not loaded. Please wait or refresh.");

    // COD Order
    if (selectedMethod === "COD") {
      try {
        const orderData: OrderCreationResponse = await createOrder({
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
          redirectToSuccess(orderData);
          return;
        }

        alert("COD Order placed successfully!");
        dispatch(resetCheckout());
        redirectToSuccess(orderData);
      } catch (error: any) {
        console.error("❌ COD Order Error:", error);
        const errorMessage = error?.data?.message || error?.message || "Failed to place COD order";
        alert(errorMessage);
      }
      return;
    }

    // Online/Advance Payment
    if (selectedMethod === "RAZORPAY" || selectedMethod === "ADVANCE") {
      const razorpayLoaded = await loadRazorpayScript();
      if (!razorpayLoaded) {
        return alert("Failed to load payment system. Please refresh and try again.");
      }

      try {
        const paymentAmount = calculateTotalAmount;
        const razorpayOrder = await createRazorpayOrder(paymentAmount).unwrap();

        const options = {
          key: APP_CONFIG.razorpayKeyId,
          amount: razorpayOrder.amount,
          currency: APP_CONFIG.currency,
          name: APP_CONFIG.companyName,
          description:
            selectedMethod === "ADVANCE"
              ? `Advance Payment (${pricingData.advancePercentage}%) - ${orderItems.length} items`
              : `Online Payment - ${orderItems.length} items`,
          order_id: razorpayOrder.orderId,

          handler: async (response: any) => {
            try {
              const orderData: OrderCreationResponse = await createOrder({
                data: {
                  items: orderItems,
                  shippingAddress,
                  payment: {
                    method: "RAZORPAY" as const,
                    isAdvance: selectedMethod === "ADVANCE",
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
                redirectToSuccess(orderData);
                return;
              }

              const remainingAmount = safeNumber(pricingData.remainingAmount);
              const successMessage =
                selectedMethod === "ADVANCE"
                  ? `Advance payment successful! Remaining ₹${safeToFixed(
                      remainingAmount
                    )} will be collected on delivery.`
                  : "Payment successful and order placed!";

              alert(successMessage);
              dispatch(resetCheckout());
              redirectToSuccess(orderData);
            } catch (e: any) {
              console.error("❌ Order Creation Error:", e);
              const errorMessage = e?.data?.message || e?.message || "Failed to record order after payment";
              alert(errorMessage);
            }
          },

          prefill: {
            name: shippingAddress.fullName,
            contact: shippingAddress.mobile,
          },
          theme: { color: "#6366f1" },
          modal: {
            ondismiss: () => console.log("💡 Payment cancelled by user"),
          },
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", (response: any) => {
          console.error("❌ Payment Failed:", response.error);
          alert(`Payment failed: ${response.error.description || "Please try again"}`);
        });
        rzp.open();
      } catch (error: any) {
        console.error("❌ Payment Initiation Error:", error);
        const errorMessage = error?.data?.message || error?.message || "Failed to initiate payment";
        alert(`${errorMessage}. Please try again.`);
      }
    }
  };

  // Loading States
  if (
    (type === "direct_purchase" && loadingProduct) ||
    (type === "cart_purchase" && cartLoading) ||
    loadingPricing
  ) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payment details...</p>
        </div>
      </div>
    );
  }

  // No Items Error
  if (!orderItems.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            No Items for Payment
          </h2>
          <p className="text-gray-600 mb-6">
            Please add items to cart or select a product.
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
      </div>
    );
  }

  // No Pricing Data Error
  if (!pricingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-orange-500 text-6xl mb-4">⏳</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Loading Pricing...
          </h2>
          <p className="text-gray-600 mb-6">
            Please wait while we calculate your order total.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200">
          {/* Payment Header */}
          <div className="p-6 border-b border-gray-200 text-center">
            <h1 className="text-2xl font-bold mb-2 text-gray-800">
              Choose Payment Method
            </h1>
            <p className="text-gray-600 mb-4">
              {orderItems.length === 1
                ? product?.name || "Product"
                : `${orderItems.length} products`}
            </p>
            <p className="text-lg font-semibold text-blue-600">
              Order Total: ₹{safeToFixed(pricingData?.subtotal)}
            </p>
          </div>

          {/* Payment Options */}
          <div className="p-6">
            <div className="space-y-4">
              {/* Online Payment */}
              <label
                className={`block p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                  selectedMethod === "RAZORPAY"
                    ? "border-blue-500 bg-blue-50 shadow-md"
                    : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value="RAZORPAY"
                  checked={selectedMethod === "RAZORPAY"}
                  onChange={() => setSelectedMethod("RAZORPAY")}
                  className="sr-only"
                />
                <div className="flex items-start">
                  <span className="text-3xl mr-4">💳</span>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          Pay Online (Full Amount)
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Credit Card • UPI • Net Banking
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          ✅ Secure & No extra charges
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">
                          ₹{safeToFixed(
                            safeNumber(pricingData?.subtotal) +
                              safeNumber(pricingData?.packagingFee) +
                              safeNumber(pricingData?.deliveryCharge)
                          )}
                        </div>
                        <div className="text-xs text-gray-500">Pay now</div>
                      </div>
                    </div>
                  </div>
                  {selectedMethod === "RAZORPAY" && (
                    <span className="text-blue-500 text-xl ml-2">✓</span>
                  )}
                </div>
              </label>

              {/* Advance Payment */}
              {isAdvanceEligible && (
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
                          <h4 className="font-semibold text-gray-800">
                            {safeNumber(pricingData?.advancePercentage)}% Advance Payment
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Pay ₹{safeToFixed(pricingData?.advanceAmount)} of product cost now
                          </p>
                          <p className="text-sm text-gray-600">
                            Rest ₹{safeToFixed(pricingData?.remainingAmount)} + delivery charges on delivery
                          </p>
                          <p className="text-xs text-green-600 mt-1">
                            ✅ Secure & 💰 Save ₹{safeToFixed(pricingData?.codHandlingFee)} COD fee!
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xl font-bold text-green-600">
                            ₹{safeToFixed(
                              safeNumber(pricingData?.advanceAmount) +
                                safeNumber(pricingData?.packagingFee) +
                                safeNumber(pricingData?.deliveryCharge)
                            )}
                          </div>
                          <div className="text-xs text-gray-500">Pay now</div>
                          <div className="text-xs text-orange-600 mt-1">
                            + ₹{safeToFixed(pricingData?.remainingAmount)} on delivery
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

              {/* Cash on Delivery */}
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
                        <h4 className="font-semibold text-gray-800">
                          Cash on Delivery
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Pay when order arrives
                        </p>
                        <p className="text-xs text-orange-600 mt-1">
                          + ₹{safeToFixed(pricingData?.codHandlingFee)} handling fee
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-orange-600">
                          ₹{safeToFixed(
                            safeNumber(pricingData?.subtotal) +
                              safeNumber(pricingData?.packagingFee) +
                              safeNumber(pricingData?.deliveryCharge) +
                              safeNumber(pricingData?.codHandlingFee)
                          )}
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

            {/* Price Breakdown */}
            {selectedMethod && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="font-semibold text-gray-800 mb-3">Price Breakdown:</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Product Total:</span>
                    <span>₹{safeToFixed(pricingData?.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Packaging Fee:</span>
                    <span>₹{safeToFixed(pricingData?.packagingFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charges:</span>
                    <span>₹{safeToFixed(pricingData?.deliveryCharge)}</span>
                  </div>
                  {selectedMethod === "COD" && (
                    <div className="flex justify-between text-orange-600">
                      <span>COD Handling Fee:</span>
                      <span>₹{safeToFixed(pricingData?.codHandlingFee)}</span>
                    </div>
                  )}
                  {selectedMethod === "ADVANCE" && (
                    <>
                      <div className="flex justify-between text-green-600">
                        <span>Advance ({safeNumber(pricingData?.advancePercentage)}% of product):</span>
                        <span>₹{safeToFixed(pricingData?.advanceAmount)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Remaining product amount:</span>
                        <span>₹{safeToFixed(pricingData?.remainingAmount)}</span>
                      </div>
                    </>
                  )}
                  <hr className="my-2" />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total to Pay {selectedMethod === "ADVANCE" ? "Now" : ""}:</span>
                    <span className="text-green-600">₹{safeToFixed(calculateTotalAmount)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Action Button */}
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
                `Pay Advance ₹${safeToFixed(calculateTotalAmount)}`
              ) : selectedMethod === "RAZORPAY" ? (
                `Pay ₹${safeToFixed(calculateTotalAmount)}`
              ) : (
                "Select Payment Method"
              )}
            </button>

            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                🔒 Your payment information is secure and encrypted
              </p>
              {!isAdvanceEligible && (
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
