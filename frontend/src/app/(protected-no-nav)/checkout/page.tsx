"use client";
function assertSellingPrice(
  value: unknown,
  context: string
): asserts value is number {
  if (typeof value !== "number") {
    throw new Error(`Invariant failed: sellingPrice missing (${context})`);
  }
}
import { toast } from "react-hot-toast";
import { useState, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import {
  useGetCartQuery,
  useUpdateQuantityMutation,
} from "@/redux/services/user/cartApi";
import { useGetProductByIDQuery } from "@/redux/services/user/publicProductApi";
import { useGetCheckoutPricingMutation } from "@/redux/services/user/orderApi";
import CheckoutSummary, {
  CheckoutItem,
} from "@/components/checkout/CheckoutSummary";
import AddressSection from "@/components/checkout/AddressSection";
import { RootState } from "@/redux/store";
import {
  updateQuantity,
  updateItemQuantity,
  updateFees,
  setAdvanceEligibility,
} from "@/redux/slices/checkoutSlice";
import { CheckoutPricingResponse } from "@/types/order";
import type { Variant } from "@/types/Product"; // adjust path if needed

/**
 * CheckoutPage
 * - Left: AddressSection (on top) + CheckoutSummary (below selected address)
 * - Right: OrderTotals (sticky) with total quantity & final price + CTA
 */

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { items, type, selectedAddress, isRehydrated } = useSelector(
    (state: RootState) => state.checkout
  );

  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null);
  const [pricingData, setPricingData] = useState<
    CheckoutPricingResponse | undefined
  >(undefined);
  const [loadingPricing, setLoadingPricing] = useState(false);
  const quantityUpdateInProgress = useRef(false);

  const productId =
    type === "direct_purchase" && items.length > 0 ? items[0].productId : null;

  const { data: product, isLoading: productLoading } = useGetProductByIDQuery(
    productId || "",
    { skip: !productId || !isRehydrated }
  );

  const {
    data: cartData,
    isLoading: cartLoading,
    refetch: refetchCart,
  } = useGetCartQuery(undefined, {
    skip: type !== "cart_purchase" || !isRehydrated,
  });

  const [updateQty] = useUpdateQuantityMutation();
  const [getCheckoutPricing] = useGetCheckoutPricingMutation();

  // subtotal computation (same as before)
  const subtotal = useMemo(() => {
    // ---------- DIRECT PURCHASE ----------
    if (type === "direct_purchase" && items.length && product) {
      const item = items[0];
      const variant = product.variants?.find((v) => v._id === item.variantId);
      if (!variant) return 0;

      assertSellingPrice(variant.sellingPrice, "direct_purchase variant");

      return variant.sellingPrice * item.quantity;
    }

    // ---------- CART PURCHASE ----------
    if (type === "cart_purchase" && cartData?.items?.length) {
      return cartData.items.reduce((sum, item) => {
        const variant = item.product.variants.find(
          (v) => v._id === item.variantId
        );

        if (!variant) return sum;

        assertSellingPrice(variant.sellingPrice, "cart_purchase variant");

        return sum + variant.sellingPrice * item.quantity;
      }, 0);
    }

    return 0;
  }, [type, items, product, cartData]);

  // checkout items shape (same)
  const checkoutItems: CheckoutItem[] = useMemo(() => {
    // ---------- DIRECT PURCHASE ----------
    if (type === "direct_purchase" && items.length > 0 && product) {
      const item = items[0];
      const selectedVariant = product.variants?.find(
        (v) => v._id === item.variantId
      );

      if (!selectedVariant) return [];

      return [
        {
          quantity: item.quantity,
          variantId: selectedVariant._id!,

          product: {
            _id: product._id,
            name: product.name,
            slug: product.slug,
            variants: [selectedVariant], // 👈 ONLY selected variant
          },
        },
      ];
    }

    // ---------- CART PURCHASE ----------
    if (type === "cart_purchase" && cartData?.items?.length) {
      return cartData.items.map((item) => {
        const variant = item.product.variants[0]!;

        return {
          quantity: item.quantity,
          variantId: variant._id!, // 👈 derived from variant

          product: {
            _id: item.product._id,
            name: item.product.name,
            slug: item.product.slug,
            variants: [variant], // 👈 exactly one
          },
        };
      });
    }

    return [];
  }, [type, items, product, cartData]);
  const hasOutOfStockItem = useMemo(() => {
    return checkoutItems.some((item) => {
      const variant = item.product.variants.find(
        (v) => v._id === item.variantId
      );

      if (!variant) return true;

      const stock = variant.stock ?? 0;
      return stock <= 0;
    });
  }, [checkoutItems]);

  // fetch pricing when address chosen (same logic)
  useEffect(() => {
    if (!isRehydrated || !selectedAddress?.pincode) return;

    // 🔒 cart_purchase: cartData must be present
    if (type === "cart_purchase" && !cartData?.items?.length) return;

    // 🔒 direct_purchase: redux items must be present
    if (type === "direct_purchase" && items.length === 0) return;

    let cancelled = false;
    const fetchPricing = async () => {
      setLoadingPricing(true);
      try {
        const orderItems =
          type === "cart_purchase"
            ? (cartData?.items ?? []).map((item) => ({
                productId: item.product._id,
                variantId: item.product.variants[0]._id,
                quantity: item.quantity,
              }))
            : items.map((item) => ({
                productId: item.productId,
                variantId: item.variantId!,
                quantity: item.quantity,
              }));

        const response = await getCheckoutPricing({
          items: orderItems,
          pincode: selectedAddress.pincode,
        }).unwrap();

        if (cancelled) return;

        setPricingData(response);
        setDeliveryAvailable(response.isServiceable !== false);
        setDeliveryInfo(response.deliveryInfo || null);

        if (
          response.packagingFee !== undefined &&
          response.deliveryCharge !== undefined
        ) {
          dispatch(
            updateFees({
              packagingFee: response.packagingFee,
              deliveryCharge: response.deliveryCharge,
              totalAmount: response.checkoutTotal,
            })
          );
        }

        if (response.advanceEligible) {
          dispatch(
            setAdvanceEligibility({
              eligible: response.advanceEligible,
              orderValue: response.subtotal || subtotal,
              percentage: response.advancePercentage,
              advanceAmount: response.advanceAmount,
              remainingAmount: response.remainingAmount,
            })
          );
        }
      } catch (error: any) {
        console.error("[CHECKOUT] Pricing fetch failed:", error);
        setPricingData(undefined);
        setDeliveryAvailable(false);
      } finally {
        if (!cancelled) setLoadingPricing(false);
      }
    };

    fetchPricing();
    return () => {
      cancelled = true;
    };
  }, [
    selectedAddress?.pincode,
    items,
    cartData,
    isRehydrated,
    getCheckoutPricing,
    dispatch,
  ]);

  // redirect if no checkout data
  useEffect(() => {
    if (!isRehydrated) return;

    // cart_purchase: cart API se aane do
    if (type === "cart_purchase") return;

    // direct_purchase: item required
    if (type === "direct_purchase" && items.length === 0) {
      router.push("/cart");
    }
  }, [type, items, router, isRehydrated]);

  // quantity change (same)
  const handleQuantityChange = async (index: number, newQuantity: number) => {
    const item = checkoutItems[index];
    if (!item) return;

    const variant = item.product.variants?.find(
      (v: Variant) => v._id === item.variantId
    );
    if (!variant) return;

    const stock = variant.stock ?? 0;

    // 🚫 Out of stock → stop + feedback
    if (stock <= 0) {
      toast.error("This item is out of stock");
      return;
    }

    const clamped = Math.max(1, Math.min(newQuantity, stock));

    // 🔒 Prevent rapid double updates
    if (quantityUpdateInProgress.current) return;

    try {
      quantityUpdateInProgress.current = true;

      if (type === "direct_purchase") {
        dispatch(updateQuantity(clamped));
      } else if (type === "cart_purchase") {
        dispatch(
          updateItemQuantity({
            productId: item.product._id,
            variantId: item.variantId,
            quantity: clamped,
          })
        );

        await updateQty({
          productId: item.product._id,
          variantId: item.variantId,
          quantity: clamped,
        }).unwrap();

        await refetchCart();
      }
    } catch (err: any) {
      console.error("[CHECKOUT] Failed to update quantity:", err);
      if (type === "cart_purchase") await refetchCart();
      toast.error("Failed to update cart quantity");
    } finally {
      quantityUpdateInProgress.current = false;
    }
  };

  const handleProceedToPayment = () => {
    if (!selectedAddress) {
      toast("Please select a delivery address");
      return;
    }
    if (!deliveryAvailable) {
      toast("Delivery not available for this address");
      return;
    }
    router.push("/checkout/payment");
  };

  const handleAddressSelection = (
    deliverable: boolean,
    pricingData?: CheckoutPricingResponse
  ) => {
    // 🔁 reset old pricing first
    setPricingData(undefined);
    setDeliveryInfo(null);
    setDeliveryAvailable(deliverable);

    if (pricingData) {
      setPricingData(pricingData);
      setDeliveryInfo(pricingData.deliveryInfo);
    }
  };

  // helper: compute total quantity
  const totalQuantity = useMemo(() => {
    return checkoutItems.reduce((s, it) => s + (it.quantity || 0), 0);
  }, [checkoutItems]);

  // helper: final price (prefer pricingData.checkoutTotal if available)
  const finalPrice = useMemo(() => {
    return pricingData?.checkoutTotal ?? subtotal;
  }, [pricingData, subtotal]);

  // Loading skeleton
  if (!isRehydrated || cartLoading || productLoading) {
    return (
      <div
        className="flex justify-center items-center min-h-screen"
        style={{ background: "var(--color-primary)" }}
      >
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2"
            style={{ borderColor: "var(--color-accent)" }}
          />
          <p className="mt-4" style={{ color: "var(--text-accent)" }}>
            Loading checkout...
          </p>
        </div>
      </div>
    );
  }

  // empty state
  if (
    type === "direct_purchase" &&
    isRehydrated &&
    checkoutItems.length === 0
  ) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--color-primary)" }}
      >
        <div
          style={{
            background: "var(--color-card)",
            padding: 28,
            borderRadius: 14,
            boxShadow: "var(--elevation-1)",
          }}
        >
          <div
            style={{
              fontSize: 48,
              color: "var(--text-accent)",
              marginBottom: 8,
            }}
          >
            🛒
          </div>
          <h2
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "var(--text-dark)",
              marginBottom: 8,
            }}
          >
            Nothing to Checkout
          </h2>
          <p style={{ color: "var(--text-accent)", marginBottom: 12 }}>
            Add some items to your cart to continue.
          </p>
          <button
            onClick={() => router.push("/products")}
            style={{
              background: "var(--color-accent)",
              color: "var(--text-light)",
              padding: "10px 14px",
              borderRadius: 8,
              fontWeight: 700,
            }}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{ background: "var(--color-primary)" }}
      className="min-h-screen py-6 px-4"
    >
      <div className="max-w-7xl mx-auto">
        <h1
          style={{ color: "var(--text-dark)" }}
          className="text-2xl font-bold mb-4"
        >
          Checkout
        </h1>

        <div className="grid lg:grid-cols-[1fr_340px] gap-6">
          {/* LEFT: Address + (selected) CheckoutSummary */}
          <div>
            <AddressSection
              onSelectionChange={handleAddressSelection}
              items={items}
              type={type}
            />

            {/* Show product summary below selected address (if any address selected) */}
            <div className="mt-4">
              <h2
                style={{ color: "var(--text-dark)" }}
                className="text-lg font-semibold mb-2"
              >
                Order Items
              </h2>
              <CheckoutSummary
                items={checkoutItems}
                subtotal={subtotal}
                allowQuantityEdit
                onQuantityChange={handleQuantityChange}
                pricingData={pricingData}
                loadingPricing={loadingPricing}
                deliveryInfo={deliveryInfo}
                deliveryAvailable={deliveryAvailable}
                hasSelectedAddress={!!selectedAddress}
              />
            </div>
          </div>

          {/* RIGHT: Totals & CTA */}
          <aside className="sticky top-20 self-start">
            <div
              style={{
                background: "var(--color-card)",
                padding: 18,
                borderRadius: 12,
                boxShadow: "var(--elevation-1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 13, color: "var(--text-accent)" }}>
                    Items
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "var(--text-dark)",
                    }}
                  >
                    {totalQuantity}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 13, color: "var(--text-accent)" }}>
                    Total
                  </div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 800,
                      color: "var(--color-accent)",
                    }}
                  >
                    ₹{finalPrice?.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* small breakdown */}
              <div
                style={{
                  borderTop: `1px solid var(--color-border-custom)`,
                  paddingTop: 12,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: "var(--text-accent)" }}>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: "var(--text-accent)" }}>Packaging</span>
                  <span>₹{(pricingData?.packagingFee ?? 0).toFixed(2)}</span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span style={{ color: "var(--text-accent)" }}>Delivery</span>
                  <span>
                    {loadingPricing
                      ? "Checking..."
                      : pricingData?.deliveryCharge === 0
                      ? "FREE"
                      : `₹${(pricingData?.deliveryCharge ?? 0).toFixed(2)}`}
                  </span>
                </div>
              </div>

              <button
                onClick={handleProceedToPayment}
                disabled={
                  !selectedAddress ||
                  !deliveryAvailable ||
                  loadingPricing ||
                  !pricingData ||
                  hasOutOfStockItem
                }
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  borderRadius: 10,
                  fontWeight: 800,
                  background:
                    !selectedAddress ||
                    !deliveryAvailable ||
                    loadingPricing ||
                    !pricingData ||
                    hasOutOfStockItem
                      ? "var(--color-hover-card)"
                      : "var(--color-accent)",
                  color: "var(--text-light)",
                  cursor:
                    !selectedAddress ||
                    !deliveryAvailable ||
                    loadingPricing ||
                    !pricingData ||
                    hasOutOfStockItem
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {!selectedAddress
                  ? "Select Address"
                  : hasOutOfStockItem
                  ? "Item Out of Stock"
                  : !deliveryAvailable
                  ? "Delivery Not Available"
                  : loadingPricing
                  ? "Calculating..."
                  : `Proceed • ₹${finalPrice?.toFixed(2)}`}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
