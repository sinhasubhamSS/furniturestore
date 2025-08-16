"use client";

import React, { useEffect } from "react"; // Added useEffect
import { useDispatch, useSelector } from "react-redux";
import {
  setSelectedColor,
  setSelectedSize,
  setSelectedVariant,
  setSelectedImage, // Added import if not already there
} from "@/redux/slices/ProductDetailSlice";
import { RootState } from "@/redux/store";
import { Variant } from "@/types/Product";

type Props = {
  variants: Variant[];
};

const VariantSelector: React.FC<Props> = ({ variants }) => {
  const dispatch = useDispatch();
  const { selectedColor, selectedSize, selectedVariant } = useSelector(
    // Added selectedVariant here
    (state: RootState) => state.productDetail
  );

  // Initial setup on mount or variants change
  useEffect(() => {
    if (variants.length > 0 && !selectedVariant) {
      // Now selectedVariant is defined, so no error
      // Only if not already set
      const firstVariant = variants[0];
      dispatch(setSelectedVariant(firstVariant));
      dispatch(setSelectedColor(firstVariant.color || null));
      dispatch(setSelectedSize(firstVariant.size || null));
      dispatch(setSelectedImage(firstVariant.images?.[0]?.url || null));
    }
  }, [variants, selectedVariant, dispatch]); // Added selectedVariant to dependencies for better reactivity

  // Unique colors (filter out null/undefined)
  const colors = Array.from(
    new Set(variants.map((v) => v.color).filter(Boolean))
  ) as string[];

  // Unique sizes, filtered by selected color if available
  const sizes = Array.from(
    new Set(
      (selectedColor
        ? variants.filter((v) => v.color === selectedColor).map((v) => v.size)
        : variants.map((v) => v.size)
      ).filter(Boolean)
    )
  ) as string[];

  const handleColorSelect = (color: string) => {
    dispatch(setSelectedColor(color));
    // Find matching variant (with current size if selected)
    const variant =
      variants.find((v) => v.color === color && v.size === selectedSize) ||
      variants.find((v) => v.color === color) || // Fallback
      null;
    dispatch(setSelectedVariant(variant));
    if (variant) {
      dispatch(setSelectedImage(variant.images?.[0]?.url || null)); // Added for image sync
    }
  };

  const handleSizeSelect = (size: string) => {
    dispatch(setSelectedSize(size));
    // Find matching variant (with current color if selected)
    const variant =
      variants.find((v) => v.size === size && v.color === selectedColor) ||
      variants.find((v) => v.size === size) || // Fallback
      null;
    dispatch(setSelectedVariant(variant));
    if (variant) {
      dispatch(setSelectedImage(variant.images?.[0]?.url || null)); // Added for image sync
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
                    : "border-transparent"
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
              // Optional: Disable if not available for selected color
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
