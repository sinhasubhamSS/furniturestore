"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { setQuantity } from "@/redux/slices/ProductDetailSlice";

const QuantitySelector: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { quantity, selectedVariant } = useSelector(
    (state: RootState) => state.productDetail,
  );

  const maxQty = selectedVariant?.stock || 1;

  return (
    <div className="flex items-center gap-3">
      {/* Label */}
      <span className="text-sm font-medium text-gray-700">Qty</span>

      {/* Counter */}
      <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
        <button
          type="button"
          aria-label="Decrease quantity"
          onClick={() => dispatch(setQuantity(Math.max(1, quantity - 1)))}
          disabled={quantity <= 1}
          className="
            w-9 h-9
            flex items-center justify-center
            text-lg text-gray-700
            hover:bg-gray-100
            disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          −
        </button>

        <span className="w-10 text-center text-sm font-medium select-none">
          {quantity}
        </span>

        <button
          type="button"
          aria-label="Increase quantity"
          onClick={() => dispatch(setQuantity(Math.min(maxQty, quantity + 1)))}
          disabled={quantity >= maxQty}
          className="
            w-9 h-9
            flex items-center justify-center
            text-lg text-gray-700
            hover:bg-gray-100
            disabled:opacity-40 disabled:cursor-not-allowed
          "
        >
          +
        </button>
      </div>

    
    </div>
  );
};

export default QuantitySelector;
