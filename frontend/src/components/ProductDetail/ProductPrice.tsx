"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { FaHeart } from "react-icons/fa";

const ProductPrice: React.FC = () => {
  const { selectedVariant } = useSelector(
    (state: RootState) => state.productDetail
  );

  return (
    <div className="flex items-center justify-between py-4 border-t border-b border-gray-100">
      <div>
        {/* Simplified - Only show final price */}
        <span className="text-3xl font-bold text-[--color-accent]">
          ₹
          {selectedVariant?.price?.toFixed(2) ||
            selectedVariant?.basePrice?.toFixed(2) ||
            "0.00"}
        </span>

        {/* GST Info */}
        <p className="text-sm text-gray-500 mt-1">
          Inclusive of GST ({selectedVariant?.gstRate || 0}%)
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <button className="p-2 rounded-full hover:bg-gray-100">
          <FaHeart className="text-gray-500 hover:text-red-500" />
        </button>
      </div>
    </div>
  );
};

export default ProductPrice;
