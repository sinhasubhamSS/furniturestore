"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setSelectedVariant } from "@/redux/slices/ProductDetailSlice";
import { Variant } from "@/types/Product";
import { RootState } from "@/redux/store";

type Props = {
  variants: Variant[];
};

const VariantSelector: React.FC<Props> = ({ variants }) => {
  const dispatch = useDispatch();

  const selectedVariant = useSelector(
    (state: RootState) => state.productDetail.selectedVariant,
  );

  const [finish, setFinish] = useState<string | null>(null);
  const [size, setSize] = useState<string | null>(null);

  /* ========= DERIVED ========= */

  const finishes = useMemo(
    () =>
      Array.from(
        new Set(
          variants
            .map((v) => v.attributes?.finish)
            .filter((v): v is string => Boolean(v)),
        ),
      ),
    [variants],
  );

  const sizesForFinish = useMemo(() => {
    if (!finish) return [];
    return Array.from(
      new Set(
        variants
          .filter((v) => v.attributes?.finish === finish)
          .map((v) => v.attributes?.size)
          .filter((v): v is string => Boolean(v)),
      ),
    );
  }, [variants, finish]);

  /* ========= INIT PRIMARY VARIANT ========= */

  useEffect(() => {
    if (!variants.length) return;
    const primary = variants.find((v) => v.stock > 0) || variants[0];
    dispatch(setSelectedVariant(primary));
  }, [variants, dispatch]);

  /* ========= SYNC UI WITH REDUX ========= */

  useEffect(() => {
    if (!selectedVariant) return;
    setFinish(selectedVariant.attributes?.finish ?? null);
    setSize(selectedVariant.attributes?.size ?? null);
  }, [selectedVariant]);

  /* ========= HANDLERS ========= */

  const handleFinishSelect = (f: string) => {
    const match =
      variants.find((v) => v.attributes?.finish === f && v.stock > 0) ||
      variants.find((v) => v.attributes?.finish === f);

    if (!match) return;
    dispatch(setSelectedVariant(match));
  };

  const handleSizeSelect = (s: string) => {
    const match = variants.find(
      (v) => v.attributes?.finish === finish && v.attributes?.size === s,
    );
    if (!match) return;
    dispatch(setSelectedVariant(match));
  };

  const isSizeAvailable = (s: string) =>
    variants.some(
      (v) =>
        v.attributes?.finish === finish &&
        v.attributes?.size === s &&
        v.stock > 0,
    );

  /* ========= UI ========= */

  return (
    <div className="space-y-5">
      {/* ================= FINISH ================= */}
      {finishes.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Finish</p>

          <div className="flex flex-wrap gap-2">
            {finishes.map((f) => {
              const active = finish === f;

              return (
                <button
                  key={f}
                  onClick={() => handleFinishSelect(f)}
                  className={`
                    px-3 py-1.5
                    text-xs md:text-sm
                    rounded-full
                    border
                    transition
                    ${
                      active
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                    }
                  `}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= SIZE ================= */}
      {sizesForFinish.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Size</p>

          <div className="flex flex-wrap gap-2">
            {sizesForFinish.map((s) => {
              const available = isSizeAvailable(s);
              const active = size === s;

              return (
                <button
                  key={s}
                  disabled={!available}
                  onClick={() => handleSizeSelect(s)}
                  className={`
                    min-w-[60px]
                    px-3 py-1.5
                    text-xs md:text-sm
                    rounded-md
                    border
                    transition
                    ${
                      active
                        ? "bg-gray-900 text-white border-gray-900"
                        : "bg-white text-gray-700 border-gray-300 hover:border-gray-500"
                    }
                    ${!available ? "opacity-40 cursor-not-allowed" : ""}
                  `}
                >
                  {s}
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
