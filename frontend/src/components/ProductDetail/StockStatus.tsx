"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const StockStatus: React.FC = () => {
  const { selectedVariant } = useSelector(
    (state: RootState) => state.productDetail,
  );

  if (!selectedVariant) return null;

  const inStock = selectedVariant.stock > 0;

  return (
    <div
      className={`
        inline-flex items-center
        px-3 py-1.5
        rounded-md
        text-xs md:text-sm
        font-medium
        ${
          inStock
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }
      `}
    >
      {inStock ? (
        <>
          <span className="mr-1.5">●</span>
          In stock
          <span className="ml-1 text-green-600">({selectedVariant.stock})</span>
        </>
      ) : (
        <>
          <span className="mr-1.5">●</span>
          Out of stock
        </>
      )}
    </div>
  );
};

export default StockStatus;
