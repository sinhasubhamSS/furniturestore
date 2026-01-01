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
import { useEffect, useMemo, useRef, useState } from "react";
import { OrderCreationResponse, PaymentMethod } from "@/types/order";

/* ================= CONFIG ================= */

const APP_CONFIG = {
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_key",
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || "SUVIDHA Store",
  currency: "INR",
};

const generateIdempotencyKey = () =>
  `order_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const safeNumber = (v: any) => (typeof v === "number" && !isNaN(v) ? v : 0);

const safeToFixed = (v: any, d = 2) => safeNumber(v).toFixed(d);

/* ================= COMPONENT ================= */

const PaymentPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    items,
    type,
    selectedAddress: shippingAddress,
  } = useSelector((state: RootState) => state.checkout);

  /* ================= MUTATIONS ================= */

  const [createOrder, { isLoading: placingOrder }] = useCreateOrderMutation();
  const [createRazorpayOrder] = useCreateRazorpayOrderMutation();
  const [getCheckoutPricing] = useGetCheckoutPricingMutation();

  /* ================= LOCAL STATE ================= */

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(
    null
  );
  const [pricingData, setPricingData] = useState<any>(null);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");
  const pricingKeyRef = useRef<string | null>(null);
  const paymentInProgressRef = useRef(false);

  useEffect(() => {
    setIdempotencyKey(generateIdempotencyKey());
  }, []);

  /* ================= ORDER ITEMS (REDUX = SOURCE OF TRUTH) ================= */

  const orderItems = useMemo(() => {
    return items.map((it) => ({
      productId: it.productId,
      variantId: it.variantId,
      quantity: it.quantity,
    }));
  }, [items]);

  /* ================= PRICING (BACKEND AUTHORITY) ================= */
  useEffect(() => {
    pricingKeyRef.current = null;
    setPricingData(null);
  }, [shippingAddress?._id]);

  useEffect(() => {
    if (!shippingAddress?.pincode || orderItems.length === 0) return;
    const key = JSON.stringify({
      pincode: shippingAddress.pincode,
      items: orderItems,
    });

    if (pricingKeyRef.current === key) return;
    pricingKeyRef.current = key;

    let cancelled = false;

    (async () => {
      setLoadingPricing(true);
      try {
        const res = await getCheckoutPricing({
          items: orderItems,
          pincode: shippingAddress.pincode,
        }).unwrap();

        if (!cancelled) {
          setPricingData({
            subtotal: safeNumber(res.subtotal),
            packagingFee: safeNumber(res.packagingFee),
            deliveryCharge: safeNumber(res.deliveryCharge),
            codHandlingFee: safeNumber(res.codHandlingFee),
            checkoutTotal: safeNumber(res.checkoutTotal),
            codTotal: safeNumber(res.codTotal),
            advanceEligible: !!res.advanceEligible,
            advanceAmount: safeNumber(res.advanceAmount),
            remainingAmount: safeNumber(res.remainingAmount),
            advancePercentage: safeNumber(res.advancePercentage),
          });
        }
      } catch (e) {
        console.error("❌ Pricing fetch failed", e);
      } finally {
        if (!cancelled) setLoadingPricing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shippingAddress?.pincode, orderItems]);

  /* ================= TOTAL CALC ================= */

  const payableNow = useMemo(() => {
    if (!pricingData) return 0;

    if (selectedMethod === "ADVANCE") {
      return (
        pricingData.advanceAmount +
        pricingData.packagingFee +
        pricingData.deliveryCharge
      );
    }

    if (selectedMethod === "COD") {
      return pricingData.codTotal;
    }

    return pricingData.checkoutTotal;
  }, [pricingData, selectedMethod]);

  /* ================= RAZORPAY ================= */

  const loadRazorpay = () =>
    new Promise<boolean>((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  /* ================= PAYMENT HANDLER ================= */

  const handlePayment = async () => {
    if (paymentInProgressRef.current) return;
    paymentInProgressRef.current = true;

    if (!selectedMethod) {
      paymentInProgressRef.current = false;
      return alert("Please select payment method");
    }
    if (!shippingAddress) {
      paymentInProgressRef.current = false;
      return alert("Please select address");
    }
    if (!pricingData) {
      paymentInProgressRef.current = false;
      return alert("Pricing not ready");
    }
    if (payableNow <= 0 || Number.isNaN(payableNow)) {
      paymentInProgressRef.current = false;
      return alert("Invalid payment amount. Please refresh.");
    }

    // COD
    if (selectedMethod === "COD") {
      const res: OrderCreationResponse = await createOrder({
        data: {
          items: orderItems,
          shippingAddress,
          payment: { method: "COD" },
          fromCart: type === "cart_purchase",
        },
        idempotencyKey,
      }).unwrap();

      dispatch(resetCheckout());
      paymentInProgressRef.current = false;
      router.push(`/order-success?orderId=${res.orderId}`);
      return;
    }

    // ONLINE / ADVANCE
    const ok = await loadRazorpay();
    if (!ok) {
      paymentInProgressRef.current = false;
      return alert("Payment system failed to load");
    }

    const razorpayOrder = await createRazorpayOrder(payableNow).unwrap();

    const rzp = new (window as any).Razorpay({
      key: APP_CONFIG.razorpayKeyId,
      amount: razorpayOrder.amount,
      currency: "INR",
      name: APP_CONFIG.companyName,
      order_id: razorpayOrder.orderId,
      handler: async (resp: any) => {
        const res = await createOrder({
          data: {
            items: orderItems,
            shippingAddress,
            fromCart: type === "cart_purchase",
            payment: {
              method: "RAZORPAY",
              isAdvance: selectedMethod === "ADVANCE",
              razorpayOrderId: resp.razorpay_order_id,
              razorpayPaymentId: resp.razorpay_payment_id,
              razorpaySignature: resp.razorpay_signature,
            },
          },
          idempotencyKey,
        }).unwrap();

        dispatch(resetCheckout());
        paymentInProgressRef.current = false;
        router.push(`/order-success?orderId=${res.orderId}`);
      },
      modal: {
        ondismiss: () => {
          paymentInProgressRef.current = false;
        },
      },
    });

    rzp.open();
  };

  /* ================= LOAD STATES ================= */

  if (loadingPricing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading payment details…
      </div>
    );
  }

  if (!pricingData || !orderItems.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Invalid checkout state
      </div>
    );
  }

  /* ================= PREMIUM UI ================= */

  return (
    <div className="min-h-screen bg-[--color-primary] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* ONLY THIS CARD IS WHITE */}
        <div
          className="bg-white rounded-xl shadow-lg border border-gray-200
                      transition-all duration-300 hover:shadow-xl"
        >
          {/* HEADER */}
          <div className="p-6 border-b border-gray-200 text-center">
            <h1 className="text-2xl font-bold text-gray-800">
              Choose Payment Method
            </h1>
            <p className="text-gray-600 mt-1">Complete your order safely</p>
          </div>

          {/* PAYMENT OPTIONS */}
          <div className="p-6 space-y-4">
            {/* ================= ONLINE PAYMENT ================= */}
            <label
              className={`block p-4 rounded-lg border-2 cursor-pointer
              transition-all duration-200 ease-out
              hover:-translate-y-0.5 hover:shadow-lg
              ${
                selectedMethod === "RAZORPAY"
                  ? "border-blue-500 bg-blue-50 shadow-md scale-[1.01]"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                checked={selectedMethod === "RAZORPAY"}
                onChange={() => setSelectedMethod("RAZORPAY")}
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
                        UPI • Cards • Net Banking
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        ✅ Secure & No extra charges
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-blue-600 transition-all duration-300">
                        ₹
                        {safeToFixed(
                          pricingData.subtotal +
                            pricingData.packagingFee +
                            pricingData.deliveryCharge
                        )}
                      </div>
                      <div className="text-xs text-gray-500">Pay now</div>
                    </div>
                  </div>
                </div>

                {selectedMethod === "RAZORPAY" && (
                  <span className="text-blue-600 text-xl ml-2">✓</span>
                )}
              </div>
            </label>

            {/* ================= ADVANCE PAYMENT ================= */}
            {pricingData?.advanceEligible && (
              <label
                className={`block p-4 rounded-lg border-2 cursor-pointer
                transition-all duration-200 ease-out
                hover:-translate-y-0.5 hover:shadow-lg
                ${
                  selectedMethod === "ADVANCE"
                    ? "border-green-500 bg-green-50 shadow-md scale-[1.01]"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  className="sr-only"
                  checked={selectedMethod === "ADVANCE"}
                  onChange={() => setSelectedMethod("ADVANCE")}
                />

                <div className="flex items-start">
                  <span className="text-3xl mr-4">⚡</span>

                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {pricingData.advancePercentage}% Advance Payment
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          Pay less now, rest on delivery
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                          💰 Save ₹{safeToFixed(pricingData.codHandlingFee)} COD
                          fee
                        </p>
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-bold text-green-600 transition-all duration-300">
                          ₹
                          {safeToFixed(
                            pricingData.advanceAmount +
                              pricingData.packagingFee +
                              pricingData.deliveryCharge
                          )}
                        </div>
                        <div className="text-xs text-gray-500">Pay now</div>
                        <div className="text-xs text-orange-600 mt-1">
                          + ₹{safeToFixed(pricingData.remainingAmount)} on
                          delivery
                        </div>
                      </div>
                    </div>
                  </div>

                  {selectedMethod === "ADVANCE" && (
                    <span className="text-green-600 text-xl ml-2">✓</span>
                  )}
                </div>
              </label>
            )}

            {/* ================= COD ================= */}
            <label
              className={`block p-4 rounded-lg border-2 cursor-pointer
              transition-all duration-200 ease-out
              hover:-translate-y-0.5 hover:shadow-lg
              ${
                selectedMethod === "COD"
                  ? "border-orange-500 bg-orange-50 shadow-md scale-[1.01]"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                className="sr-only"
                checked={selectedMethod === "COD"}
                onChange={() => setSelectedMethod("COD")}
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
                        + ₹{safeToFixed(pricingData.codHandlingFee)} handling
                        fee
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-orange-600 transition-all duration-300">
                        ₹{safeToFixed(pricingData.codTotal)}
                      </div>
                      <div className="text-xs text-gray-500">Pay later</div>
                    </div>
                  </div>
                </div>

                {selectedMethod === "COD" && (
                  <span className="text-orange-600 text-xl ml-2">✓</span>
                )}
              </div>
            </label>

            {/* ================= PRICE BREAKDOWN ================= */}
            {selectedMethod && (
              <div
                className="mt-6 p-4 bg-white rounded-lg border border-gray-200
                            transition-all duration-300"
              >
                <h5 className="font-semibold text-gray-800 mb-3">
                  Price Breakdown
                </h5>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Product Total</span>
                    <span>₹{safeToFixed(pricingData.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Packaging</span>
                    <span>₹{safeToFixed(pricingData.packagingFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery</span>
                    <span>₹{safeToFixed(pricingData.deliveryCharge)}</span>
                  </div>

                  {selectedMethod === "COD" && (
                    <div className="flex justify-between text-orange-600">
                      <span>COD Fee</span>
                      <span>₹{safeToFixed(pricingData.codHandlingFee)}</span>
                    </div>
                  )}

                  <hr />

                  <div className="flex justify-between font-bold text-lg">
                    <span>Total to Pay</span>
                    <span className="text-green-600 transition-all duration-300">
                      ₹{safeToFixed(payableNow)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={handlePayment}
              disabled={!selectedMethod || placingOrder}
              className={`w-full py-4 rounded-lg font-semibold text-lg
              transition-all duration-150 active:scale-[0.98]
              ${
                placingOrder || !selectedMethod
                  ? "bg-gray-300 text-gray-500"
                  : selectedMethod === "COD"
                  ? "bg-orange-600 hover:bg-orange-700 text-white shadow-lg"
                  : selectedMethod === "ADVANCE"
                  ? "bg-green-600 hover:bg-green-700 text-white shadow-lg"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
              }`}
            >
              {placingOrder
                ? "Processing..."
                : selectedMethod === "COD"
                ? "Place COD Order"
                : `Proceed to Pay ₹${safeToFixed(payableNow)}`}
            </button>

            <p className="mt-4 text-center text-xs text-gray-500">
              🔒 Your payment information is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
export default PaymentPage;
