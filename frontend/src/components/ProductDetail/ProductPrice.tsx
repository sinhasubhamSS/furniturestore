"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { FaHeart } from "react-icons/fa";

const ProductPrice: React.FC = () => {
  const { selectedVariant } = useSelector((state: RootState) => state.productDetail);

  return (
    <div className="flex items-center justify-between py-4 border-t border-b border-gray-100">
      <div>
        <span className="text-3xl font-bold text-[--color-accent]">
          ₹{selectedVariant?.price?.toFixed(2) || selectedVariant?.basePrice}
        </span>
        {selectedVariant?.basePrice !== selectedVariant?.price && (
          <span className="ml-2 text-gray-500 line-through">
            ₹{selectedVariant?.basePrice?.toFixed(2)}
          </span>
        )}
        <p className="text-sm text-gray-500 mt-1">
          Inclusive of GST ({selectedVariant?.gstRate}%)
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
