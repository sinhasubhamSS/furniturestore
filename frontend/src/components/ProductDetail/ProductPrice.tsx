"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { FaHeart } from "react-icons/fa";
import { Variant } from "@/types/Product";

type Props = {
  variants: Variant[];
};

const ProductPrice: React.FC<Props> = ({ variants }) => {
  const { selectedVariant } = useSelector(
    (state: RootState) => state.productDetail
  );

  if (!selectedVariant) return null;

  // UI me dikhane ke liye bas ye 2 chiz use karni hai
  const finalPrice = selectedVariant.hasDiscount
    ? selectedVariant.discountedPrice
    : selectedVariant.price;

  const gstRate = selectedVariant.gstRate || 0;

  return (
    <div className="flex items-center justify-between py-4 border-t border-b border-gray-100">
      <div>
        <div className="flex items-baseline space-x-2">
          {/* Final Price */}
          <span className="text-3xl font-bold text-[--color-accent]">
            ₹{finalPrice?.toLocaleString()}
          </span>

          {/* Original Price (agar discount hai to cut dikhana) */}
          {selectedVariant.hasDiscount && (
            <span className="text-lg line-through text-gray-400">
              ₹{selectedVariant.price?.toLocaleString()}
            </span>
          )}

          {/* Discount Percent */}
          {selectedVariant.hasDiscount && (
            <span className="text-sm font-semibold text-green-600">
              {selectedVariant.discountPercent}% off
            </span>
          )}
        </div>

        {/* Savings Amount */}
        {selectedVariant.hasDiscount && (
          <p className="text-sm text-green-600 mt-1">
            You save ₹{selectedVariant.savings?.toLocaleString()}
          </p>
        )}

        {/* GST Info */}
        <p className="text-sm text-gray-500 mt-1">
          Inclusive of GST ({gstRate}%)
        </p>
      </div>

      
    </div>
  );
};

export default ProductPrice;
