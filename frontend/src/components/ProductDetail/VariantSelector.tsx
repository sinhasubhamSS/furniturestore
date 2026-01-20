"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { setSelectedVariant } from "@/redux/slices/ProductDetailSlice";
import { Variant } from "@/types/Product";

type Props = {
  variants: Variant[];
};

const VariantSelector: React.FC<Props> = ({ variants }) => {
  const dispatch = useDispatch();

  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  /* ================= DERIVED ================= */

  const colors = useMemo(
    () =>
      Array.from(
        new Set(
          variants.map((v) => v.color).filter((c): c is string => Boolean(c)),
        ),
      ),
    [variants],
  );

  const sizesForColor = useMemo(() => {
    if (!selectedColor) return [];
    return Array.from(
      new Set(
        variants
          .filter((v) => v.color === selectedColor)
          .map((v) => v.size)
          .filter((s): s is string => Boolean(s)),
      ),
    );
  }, [variants, selectedColor]);

  /* ================= INIT ================= */

  useEffect(() => {
    if (!variants.length) return;

    const first = variants.find((v) => v.color && v.size);

    if (!first) return;

    setSelectedColor(first.color ?? null);
    setSelectedSize(first.size ?? null);
    dispatch(setSelectedVariant(first));
  }, [variants, dispatch]);

  /* ================= HANDLERS ================= */

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);

    const colorVariant = variants.find((v) => v.color === color && v.size);

    if (!colorVariant) return;

    setSelectedSize(colorVariant.size ?? null);
    dispatch(setSelectedVariant(colorVariant));
  };

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);

    if (!selectedColor) return;

    const match = variants.find(
      (v) => v.color === selectedColor && v.size === size,
    );

    if (!match) return;

    dispatch(setSelectedVariant(match));
  };

  const isSizeAvailable = (size: string) => {
    if (!selectedColor) return false;

    return variants.some(
      (v) => v.color === selectedColor && v.size === size && v.stock > 0,
    );
  };

  /* ================= UI ================= */

  return (
    <div className="space-y-4">
      {/* COLOR */}
      <div>
        <h3 className="font-medium mb-2">Color</h3>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              onClick={() => handleColorSelect(color)}
              className={`px-4 py-2 rounded-full border text-sm transition
                ${
                  selectedColor === color
                    ? "bg-black text-white border-black"
                    : "bg-white border-gray-300 hover:border-black"
                }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* SIZE */}
      <div>
        <h3 className="font-medium mb-2">Size</h3>
        <div className="flex flex-wrap gap-2">
          {sizesForColor.map((size) => {
            const available = isSizeAvailable(size);
            const active = selectedSize === size;

            return (
              <button
                key={size}
                disabled={!available}
                onClick={() => handleSizeSelect(size)}
                className={`px-4 py-2 rounded-md border text-sm transition
                  ${
                    active
                      ? "bg-black text-white border-black"
                      : "bg-white border-gray-300 hover:border-black"
                  }
                  ${!available ? "opacity-50 cursor-not-allowed" : ""}
                `}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default VariantSelector;
