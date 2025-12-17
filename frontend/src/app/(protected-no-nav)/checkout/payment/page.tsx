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
import { useEffect, useMemo, useState } from "react";
import { OrderCreationResponse, PaymentMethod } from "@/types/order";

/* ================= CONFIG ================= */

const APP_CONFIG = {
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_key",
  companyName: process.env.NEXT_PUBLIC_COMPANY_NAME || "SUVIDHA Store",
  currency: "INR",
};

const generateIdempotencyKey = () =>
  `order_${Date.now()}_${Math.random().toString(36).slice(2)}`;

const safeNumber = (v: any) =>
  typeof v === "number" && !isNaN(v) ? v : 0;

const safeToFixed = (v: any, d = 2) =>
  safeNumber(v).toFixed(d);

/* ================= COMPONENT ================= */

const PaymentPage = () => {
  const dispatch = useDispatch();
  const router = useRouter();

  const {
    items,
    type,
    selectedAddress: shippingAddress,
  } = useSelector((state: RootState) => state.checkout);

  /* ---------- MUTATIONS ---------- */

  const [createOrder, { isLoading: placingOrder }] =
    useCreateOrderMutation();
  const [createRazorpayOrder] = useCreateRazorpayOrderMutation();
  const [getCheckoutPricing] = useGetCheckoutPricingMutation();

  /* ---------- LOCAL STATE ---------- */

  const [selectedMethod, setSelectedMethod] =
    useState<PaymentMethod | null>(null);
  const [pricingData, setPricingData] = useState<any>(null);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const [idempotencyKey, setIdempotencyKey] = useState("");

  useEffect(() => {
    setIdempotencyKey(generateIdempotencyKey());
  }, []);

  /* ================= ORDER ITEMS (REDUX ONLY) ================= */

  const orderItems = useMemo(() => {
    return items.map((it) => ({
      productId: it.productId,
      variantId: it.variantId,
      quantity: it.quantity,
    }));
  }, [items]);

  /* ================= PRICING (BACKEND = SOURCE OF TRUTH) ================= */

  useEffect(() => {
    if (!shippingAddress?.pincode || orderItems.length === 0) return;

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
        console.error("Pricing fetch failed", e);
      } finally {
        if (!cancelled) setLoadingPricing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [shippingAddress?.pincode, orderItems]);

  /* ================= PAYABLE AMOUNT ================= */

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
    if (!selectedMethod) return alert("Select payment method");
    if (!shippingAddress) return alert("Select address");
    if (!pricingData) return alert("Pricing not ready");

    /* ---------- COD ---------- */
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
      router.push(`/order-success?orderId=${res.orderId}`);
      return;
    }

    /* ---------- ONLINE / ADVANCE ---------- */

    const ok = await loadRazorpay();
    if (!ok) return alert("Razorpay load failed");

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
        router.push(`/order-success?orderId=${res.orderId}`);
      },
    });

    rzp.open();
  };

  /* ================= LOAD STATES ================= */

  if (loadingPricing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading payment…
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

  /* ================= UI ================= */

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Choose Payment Method</h1>

      <div className="space-y-4 mb-6">
        <label className="block border p-4 rounded cursor-pointer">
          <input
            type="radio"
            checked={selectedMethod === "RAZORPAY"}
            onChange={() => setSelectedMethod("RAZORPAY")}
            className="mr-2"
          />
          Pay Online – ₹{safeToFixed(pricingData.checkoutTotal)}
        </label>

        {pricingData.advanceEligible && (
          <label className="block border p-4 rounded cursor-pointer">
            <input
              type="radio"
              checked={selectedMethod === "ADVANCE"}
              onChange={() => setSelectedMethod("ADVANCE")}
              className="mr-2"
            />
            {pricingData.advancePercentage}% Advance – Pay ₹
            {safeToFixed(
              pricingData.advanceAmount +
                pricingData.packagingFee +
                pricingData.deliveryCharge
            )}
            <div className="text-xs text-gray-500">
              Remaining ₹{safeToFixed(pricingData.remainingAmount)} on delivery
            </div>
          </label>
        )}

        <label className="block border p-4 rounded cursor-pointer">
          <input
            type="radio"
            checked={selectedMethod === "COD"}
            onChange={() => setSelectedMethod("COD")}
            className="mr-2"
          />
          Cash on Delivery – ₹{safeToFixed(pricingData.codTotal)}
        </label>
      </div>

      <button
        onClick={handlePayment}
        disabled={placingOrder}
        className="w-full bg-blue-600 text-white py-3 rounded"
      >
        Pay ₹{safeToFixed(payableNow)}
      </button>
    </div>
  );
};

export default PaymentPage;
