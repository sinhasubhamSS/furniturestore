"use client";

import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { setQuantity } from "@/redux/slices/ProductDetailSlice";

const QuantitySelector: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { quantity, selectedVariant } = useSelector(
    (state: RootState) => state.productDetail
  );

  return (
    <div className="flex items-center">
      <h3 className="text-lg font-medium text-gray-900 mr-4">Quantity</h3>
      <div className="flex items-center border border-gray-300 rounded-md">
        <button
          className="px-4 py-2 text-gray-600 hover:bg-gray-100"
          onClick={() => dispatch(setQuantity(Math.max(1, quantity - 1)))}
          disabled={quantity <= 1}
        >
          -
        </button>
        <span className="px-4 py-2">{quantity}</span>
        <button
          className="px-4 py-2 text-gray-600 hover:bg-gray-100"
          onClick={() => dispatch(setQuantity(quantity + 1))}
          disabled={quantity >= (selectedVariant?.stock || 1)}
        >
          +
        </button>
      </div>
    </div>
  );
};

export default QuantitySelector;
