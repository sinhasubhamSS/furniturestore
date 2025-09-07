"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

const StockStatus: React.FC = () => {
  const { selectedVariant } = useSelector(
    (state: RootState) => state.productDetail
  );

  return (
    <div
      className={` py-3 px-4 rounded-lg ${
        selectedVariant?.stock && selectedVariant.stock > 0
          ? "bg-green-50 text-green-800"
          : "bg-red-50 text-red-800"
      }`}
    >
      <span className="font-medium">
        {selectedVariant?.stock && selectedVariant.stock > 0
          ? `In Stock (${selectedVariant.stock} available)`
          : "Out of Stock"}
      </span>
    </div>
  );
};

export default StockStatus;
