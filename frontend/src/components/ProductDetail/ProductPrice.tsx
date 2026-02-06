"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const ProductPrice: React.FC = () => {
  const { selectedVariant } = useSelector(
    (state: RootState) => state.productDetail,
  );

  if (!selectedVariant) return null;

  const { sellingPrice, listingPrice, savings, discountPercent } =
    selectedVariant;

  const hasDiscount =
    typeof listingPrice === "number" &&
    typeof sellingPrice === "number" &&
    listingPrice > sellingPrice;

  return (
    <div className="py-3 border-t border-b border-gray-100">
      {/* PRICE ROW */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Selling Price */}
        <span className="text-2xl md:text-3xl font-bold text-[--color-accent]">
          ₹{sellingPrice.toLocaleString()}
        </span>

        {/* MRP */}
        {hasDiscount && (
          <span className="text-sm md:text-base line-through text-gray-400">
            ₹{listingPrice.toLocaleString()}
          </span>
        )}

        {/* Discount Badge */}
        {hasDiscount &&
          typeof discountPercent === "number" &&
          discountPercent > 0 && (
            <span className="text-xs md:text-sm font-semibold text-green-600">
              {discountPercent}% off
            </span>
          )}
      </div>

      {/* Savings */}
      {hasDiscount && typeof savings === "number" && savings > 0 && (
        <p className="text-xs md:text-sm text-green-600 mt-1">
          You save ₹{savings.toLocaleString()}
        </p>
      )}

      {/* Tax Info */}
      <p className="text-xs md:text-sm text-gray-500 mt-1">
        Inclusive of all taxes
      </p>
    </div>
  );
};

export default ProductPrice;
