"use client";

import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { setSelectedVariant } from "@/redux/slices/ProductDetailSlice";
import { Variant } from "@/types/Product";

type Props = {
  variants: Variant[];
};

const VariantSelector: React.FC<Props> = ({ variants }) => {
  const dispatch = useDispatch();
  const selectedVariant = useSelector(
    (state: RootState) => state.productDetail.selectedVariant
  );

  return (
    <div className="space-y-2">
      <h3 className="font-medium">Select Variant</h3>

      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => {
          const isActive = selectedVariant?._id === variant._id;
          const isOutOfStock = variant.stock <= 0;

          return (
            <button
              key={variant._id}
              disabled={isOutOfStock}
              onClick={() => dispatch(setSelectedVariant(variant))}
              className={`px-4 py-2 border rounded-md text-sm
                ${isActive ? "bg-black text-white" : "bg-white"}
                ${isOutOfStock ? "opacity-50 cursor-not-allowed" : ""}
              `}
            >
              {variant.color} / {variant.size}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default VariantSelector;
