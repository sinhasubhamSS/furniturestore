"use client";

import Image from "next/image";
import React, { useMemo, useState } from "react";
import { Variant } from "@/types/Product";

/* ---------- Types ---------- */
export type CheckoutProductSnapshot = {
  _id: string;
  name: string;
  slug: string;
  variants: Variant[]; // ALWAYS exactly one variant
};

export type CheckoutItem = {
  product: CheckoutProductSnapshot;
  variantId: string;
  quantity: number;
};

interface CheckoutSummaryProps {
  items: CheckoutItem[];
  subtotal?: number;
  allowQuantityEdit?: boolean;
  onQuantityChange?: (index: number, quantity: number) => void | Promise<void>;
  pricingData?: any;
  loadingPricing?: boolean;
  deliveryInfo?: any; // ✅ RETAINED
  deliveryAvailable?: boolean;
  hasSelectedAddress?: boolean;
  showTotals?: boolean;
}

/* ---------- Component ---------- */
const CheckoutSummary = React.memo(
  ({
    items,
    subtotal,
    allowQuantityEdit = false,
    onQuantityChange,
    pricingData,
    loadingPricing = false,
    deliveryInfo, // ✅ still here
    deliveryAvailable = true,
    showTotals = false,
  }: CheckoutSummaryProps) => {
    const [showBreakdown, setShowBreakdown] = useState(false);

    const safeToFixed = (value: number | undefined | null, decimals = 2) => {
      if (typeof value !== "number" || isNaN(value)) return "0.00";
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
        style={{
          background: "var(--color-surface)",
          padding: 12,
          borderRadius: 10,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700 }}>
            Items ({items.length})
          </h3>

          <button
            onClick={() => setShowBreakdown((s) => !s)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--color-accent)",
              cursor: "pointer",
            }}
          >
            {showBreakdown ? "Hide" : "Details"}
          </button>
        </div>

        {/* Items */}
        <div style={{ display: "grid", gap: 8 }}>
          {items.map(({ product, variantId, quantity }, idx) => {
            const variant = product.variants.find((v) => v._id === variantId);
            if (!variant) return null;

            // 🔒 FINAL PRICE RULE
            const sellingPrice = variant.sellingPrice;
            const itemTotal = sellingPrice * quantity;

            return (
              <div
                key={`${product._id}-${variantId}`}
                style={{
                  display: "flex",
                  gap: 10,
                  padding: 8,
                  borderRadius: 8,
                  background: "var(--color-surface)",
                }}
              >
                {/* Image */}
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 8,
                    overflow: "hidden",
                    background: "var(--color-primary)",
                  }}
                >
                  <Image
                    src={variant.images?.[0]?.url || "/placeholder.jpg"}
                    alt={product.name}
                    width={64}
                    height={64}
                    priority={idx === 0} // 👈 ONLY first item
                    sizes="64px"
                    style={{ objectFit: "contain" }}
                  />
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>
                    {product.name}
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "var(--text-accent)",
                      marginTop: 4,
                    }}
                  >
                    {variant.color}
                    {variant.size ? ` • ${variant.size}` : ""}
                  </div>

                  {/* Price Row */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 6,
                    }}
                  >
                    {/* Optional MRP display */}
                    {variant.listingPrice > variant.sellingPrice && (
                      <span
                        style={{
                          fontSize: 12,
                          color: "var(--text-accent)",
                          textDecoration: "line-through",
                        }}
                      >
                        ₹{safeToFixed(variant.listingPrice)}
                      </span>
                    )}

                    <span
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        color: "var(--color-accent)",
                      }}
                    >
                      ₹{safeToFixed(sellingPrice)}
                    </span>

                    <div
                      style={{ marginLeft: "auto", display: "flex", gap: 8 }}
                    >
                      {allowQuantityEdit && onQuantityChange ? (
                        <>
                          <button
                            onClick={() =>
                              onQuantityChange(idx, Math.max(1, quantity - 1))
                            }
                            disabled={quantity <= 1}
                          >
                            −
                          </button>
                          <strong>{quantity}</strong>
                          <button
                            onClick={() => onQuantityChange(idx, quantity + 1)}
                          >
                            +
                          </button>
                        </>
                      ) : (
                        <span>x{quantity}</span>
                      )}

                      <strong>₹{safeToFixed(itemTotal)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals (optional) */}
        {showTotals && (
          <div style={{ marginTop: 12 }}>
            <div>Subtotal: ₹{safeToFixed(subtotal)}</div>
            <div>Packaging: ₹{safeToFixed(packagingFee)}</div>
            <div>
              Delivery:{" "}
              {deliveryCharge === 0
                ? "FREE"
                : `₹${safeToFixed(deliveryCharge)}`}
            </div>
            <strong>Total: ₹{safeToFixed(grandTotal)}</strong>
          </div>
        )}
      </aside>
    );
  }
);

CheckoutSummary.displayName = "CheckoutSummary";
export default CheckoutSummary;
