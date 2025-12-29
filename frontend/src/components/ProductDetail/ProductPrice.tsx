"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const ProductPrice: React.FC = () => {
  const { selectedVariant } = useSelector(
    (state: RootState) => state.productDetail
  );

  if (!selectedVariant) return null;

  const { sellingPrice, listingPrice, savings, discountPercent } =
    selectedVariant;

  const hasDiscount =
    typeof listingPrice === "number" &&
    typeof sellingPrice === "number" &&
    listingPrice > sellingPrice;

  return (
    <div className="py-4 border-t border-b border-gray-100">
      <div className="flex items-baseline gap-2">
        {/* Final Price */}
        <span className="text-3xl font-bold text-[--color-accent]">
          ₹{sellingPrice.toLocaleString()}
        </span>

        {/* MRP */}
        {hasDiscount && (
          <span className="text-lg line-through text-gray-400">
            ₹{listingPrice.toLocaleString()}
          </span>
        )}

        {/* Discount % */}
        {hasDiscount &&
          typeof discountPercent === "number" &&
          discountPercent > 0 && (
            <span className="text-sm font-semibold text-green-600">
              {discountPercent}% OFF
            </span>
          )}
      </div>

      {/* Savings */}
      {hasDiscount && typeof savings === "number" && savings > 0 && (
        <p className="text-sm text-green-600 mt-1">
          You save ₹{savings.toLocaleString()}
        </p>
      )}

      {/* GST info (simple & honest) */}
      <p className="text-sm text-gray-500 mt-1">Inclusive of all taxes</p>
    </div>
  );
};

export default ProductPrice;
