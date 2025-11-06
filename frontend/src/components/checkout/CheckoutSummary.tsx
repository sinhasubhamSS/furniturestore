"use client";

import Image from "next/image";
import { useState, useMemo } from "react";
import React from "react";
import { Product, DisplayProduct } from "@/types/Product";

export type CheckoutItem = {
  product: Product | DisplayProduct;
  variantId: string;
  quantity: number;
};

interface CheckoutSummaryProps {
  items: CheckoutItem[];
  subtotal?: number; // optional: parent can pass subtotal for totals calculation
  allowQuantityEdit?: boolean;
  onQuantityChange?: (index: number, quantity: number) => void | Promise<void>;
  pricingData?: any;
  loadingPricing?: boolean;
  deliveryInfo?: any;
  deliveryAvailable?: boolean;
  hasSelectedAddress?: boolean;
  /** If true, show subtotal/packaging/delivery/total inside this component.
   * Default false because your right-side totals already show them. */
  showTotals?: boolean;
}

const CheckoutSummary = React.memo(
  ({
    items,
    subtotal,
    allowQuantityEdit = false,
    onQuantityChange,
    pricingData,
    loadingPricing = false,
    deliveryAvailable = true,
    hasSelectedAddress = false,
    showTotals = false,
  }: CheckoutSummaryProps) => {
    const [showBreakdown, setShowBreakdown] = useState(false);

    const safeToFixed = (value: number | undefined | null, decimals = 2) => {
      if (
        typeof value !== "number" ||
        value === null ||
        value === undefined ||
        isNaN(value)
      )
        return (0).toFixed(decimals);
      return value.toFixed(decimals);
    };

    const { packagingFee, deliveryCharge, grandTotal } = useMemo(
      () => ({
        packagingFee: pricingData?.packagingFee ?? 0,
        deliveryCharge: pricingData?.deliveryCharge ?? 0,
        grandTotal: pricingData?.checkoutTotal ?? subtotal ?? 0,
      }),
      [pricingData, subtotal]
    );

    if (!items || items.length === 0) {
      return <p style={{ color: "var(--text-accent)" }}>No items in order</p>;
    }

    return (
      <aside
        role="region"
        aria-labelledby="order-summary-heading"
        style={{
          background: "var(--color-surface)",
          padding: 12,
          borderRadius: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 8,
          }}
        >
          <h3
            id="order-summary-heading"
            style={{ fontSize: 15, fontWeight: 700, color: "var(--text-dark)" }}
          >
            Items ({items.length})
          </h3>

          {/* Details toggle only toggles a lightweight breakdown UI (not main totals) */}
          <button
            onClick={() => setShowBreakdown((s) => !s)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-accent)",
              cursor: "pointer",
            }}
            aria-expanded={showBreakdown}
            aria-controls="order-items-breakdown"
          >
            {showBreakdown ? "Hide" : "Details"}
          </button>
        </div>

        <div
          style={{ display: "grid", gap: 8, maxHeight: 320, overflow: "auto" }}
        >
          {items.map(({ product, variantId, quantity }, idx) => {
            const selectedVariant = product.variants?.find(
              (v) => v._id === variantId
            );
            if (!selectedVariant) return null;

            const finalPrice = selectedVariant.hasDiscount
              ? selectedVariant.discountedPrice ?? 0
              : selectedVariant.price ?? 0;
            const itemTotal = finalPrice * quantity;

            return (
              <div
                key={`${product._id}-${variantId}`}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  padding: 8,
                  borderRadius: 8,
                  background: "var(--color-surface)",
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "var(--color-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 6,
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  <Image
                    src={selectedVariant.images?.[0]?.url || "/placeholder.jpg"}
                    alt={product.name}
                    width={64}
                    height={64}
                    style={{ objectFit: "contain" }}
                  />
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                    title={product.name}
                  >
                    {product.name}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-accent)",
                      marginTop: 4,
                    }}
                  >
                    {selectedVariant.color
                      ? `${selectedVariant.color}${
                          selectedVariant.size
                            ? ` • ${selectedVariant.size}`
                            : ""
                        }`
                      : selectedVariant.size || ""}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginTop: 6,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--color-accent)",
                      }}
                    >
                      ₹{safeToFixed(finalPrice)}
                    </div>

                    <div
                      style={{
                        marginLeft: "auto",
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      {allowQuantityEdit && onQuantityChange ? (
                        <>
                          <button
                            aria-label={`Decrease quantity for ${product.name}`}
                            onClick={() =>
                              onQuantityChange(idx, Math.max(1, quantity - 1))
                            }
                            disabled={quantity <= 1}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 999,
                              background: "var(--color-surface-secondary)",
                              border: "none",
                              cursor: quantity <= 1 ? "not-allowed" : "pointer",
                              fontSize: 14,
                            }}
                          >
                            −
                          </button>
                          <div
                            style={{
                              minWidth: 28,
                              textAlign: "center",
                              fontWeight: 600,
                            }}
                          >
                            {quantity}
                          </div>
                          <button
                            aria-label={`Increase quantity for ${product.name}`}
                            onClick={() => onQuantityChange(idx, quantity + 1)}
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 999,
                              background: "var(--color-surface-secondary)",
                              border: "none",
                              cursor: "pointer",
                              fontSize: 14,
                            }}
                          >
                            +
                          </button>
                        </>
                      ) : (
                        <div
                          style={{ fontSize: 12, color: "var(--text-accent)" }}
                        >
                          x{quantity}
                        </div>
                      )}

                      <div
                        style={{
                          fontSize: 13,
                          color: "var(--text-accent)",
                          fontWeight: 600,
                        }}
                      >
                        ₹{safeToFixed(itemTotal)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Optional totals block: shown only when showTotals=true */}
        {showTotals && (
          <div
            id="order-items-breakdown"
            style={{
              borderTop: `1px solid var(--color-border-custom)`,
              paddingTop: 10,
              marginTop: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 6,
              }}
            >
              <span style={{ color: "var(--text-accent)", fontSize: 13 }}>
                Subtotal
              </span>
              <span style={{ fontWeight: 700 }}>₹{safeToFixed(subtotal)}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={{ color: "var(--text-accent)", fontSize: 13 }}>
                Packaging
              </span>
              <span>₹{safeToFixed(packagingFee)}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <span style={{ color: "var(--text-accent)", fontSize: 13 }}>
                Delivery
              </span>
              <span>
                {loadingPricing
                  ? "Checking..."
                  : deliveryCharge === 0
                  ? "FREE"
                  : `₹${safeToFixed(deliveryCharge)}`}
              </span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 8,
                paddingTop: 8,
                borderTop: `1px solid var(--color-border-custom)`,
              }}
            >
              <span style={{ fontWeight: 800 }}>Total</span>
              <span style={{ fontWeight: 800, color: "var(--color-accent)" }}>
                ₹{safeToFixed(grandTotal)}
              </span>
            </div>
          </div>
        )}
      </aside>
    );
  }
);

CheckoutSummary.displayName = "CheckoutSummary";
export default CheckoutSummary;
