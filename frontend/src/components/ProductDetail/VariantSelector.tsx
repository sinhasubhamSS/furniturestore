"use client";

import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedColor,
  setSelectedSize,
  setSelectedVariant,
  setSelectedImage,
} from "@/redux/slices/ProductDetailSlice";
import { RootState } from "@/redux/store";
import { Variant } from "@/types/Product";

type Props = {
  variants: Variant[];
};

const VariantSelector: React.FC<Props> = ({ variants }) => {
  const dispatch = useDispatch();
  const { selectedColor, selectedSize, selectedVariant } = useSelector(
    (state: RootState) => state.productDetail
  );

  // 🔹 Initialize default variant on first load
  useEffect(() => {
    if (variants.length > 0 && !selectedVariant) {
      const first = variants[0];
      dispatch(setSelectedVariant(first));
      dispatch(setSelectedColor(first.color || null));
      dispatch(setSelectedSize(first.size || null));
      dispatch(setSelectedImage(first.images?.[0]?.url || null));
    }
  }, [variants, selectedVariant, dispatch]);

  // 🔹 Extract unique colors
  const colors = Array.from(
    new Set(variants.map((v) => v.color).filter(Boolean))
  ) as string[];

  // 🔹 Extract unique sizes (filtered by selectedColor if chosen)
  const sizes = Array.from(
    new Set(
      (selectedColor
        ? variants.filter((v) => v.color === selectedColor).map((v) => v.size)
        : variants.map((v) => v.size)
      ).filter(Boolean)
    )
  ) as string[];

  // 🔹 Handle Color Change
  const handleColorSelect = (color: string) => {
    dispatch(setSelectedColor(color));

    const variant =
      variants.find((v) => v.color === color && v.size === selectedSize) ||
      variants.find((v) => v.color === color) ||
      null;

    if (variant) {
      dispatch(setSelectedVariant(variant));
      dispatch(setSelectedImage(variant.images?.[0]?.url || null));
      dispatch(setSelectedSize(variant.size || null));
    }
  };

  // 🔹 Handle Size Change
  const handleSizeSelect = (size: string) => {
    dispatch(setSelectedSize(size));

    const variant =
      variants.find((v) => v.size === size && v.color === selectedColor) ||
      variants.find((v) => v.size === size) ||
      null;

    if (variant) {
      dispatch(setSelectedVariant(variant));
      dispatch(setSelectedImage(variant.images?.[0]?.url || null));
      dispatch(setSelectedColor(variant.color || null));
    }
  };

  return (
    <div className="space-y-4">
      {/* Color Selector */}
      {colors.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Select Color:</h3>
          <div className="flex gap-3 flex-wrap">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorSelect(color)}
                className={`w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                  selectedColor === color
                    ? "border-black shadow-md"
                    : "border-gray-300"
                }`}
                style={{ backgroundColor: color || "#ccc" }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Size Selector */}
      {sizes.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Select Size:</h3>
          <div className="flex gap-2 flex-wrap">
            {sizes.map((size) => {
              const isAvailable = variants.some(
                (v) =>
                  v.color === selectedColor && v.size === size && v.stock > 0
              );
              return (
                <button
                  key={size}
                  onClick={() => handleSizeSelect(size)}
                  disabled={!isAvailable}
                  className={`px-4 py-2 rounded-md border text-sm font-medium transition-all duration-200
                    ${
                      selectedSize === size
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-gray-300"
                    }
                    ${!isAvailable ? "opacity-50 cursor-not-allowed" : ""}
                  `}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default VariantSelector;
