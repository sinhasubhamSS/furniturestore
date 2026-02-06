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
    <div className="space-y-4">
      {/* FINISH */}
      <div>
        <h3 className="font-medium mb-2">Finish</h3>
        <div className="flex flex-wrap gap-2">
          {finishes.map((f) => (
            <button
              key={f}
              onClick={() => handleFinishSelect(f)}
              className={`px-4 py-2 rounded-full border text-sm
                ${
                  finish === f
                    ? "bg-black text-white"
                    : "bg-white border-gray-300"
                }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* SIZE */}
      {sizesForFinish.length > 0 && (
        <div>
          <h3 className="font-medium mb-2">Size</h3>
          <div className="flex flex-wrap gap-2">
            {sizesForFinish.map((s) => {
              const available = isSizeAvailable(s);
              const active = size === s;

              return (
                <button
                  key={s}
                  disabled={!available}
                  onClick={() => handleSizeSelect(s)}
                  className={`px-4 py-2 rounded-md border text-sm
                    ${
                      active
                        ? "bg-black text-white"
                        : "bg-white border-gray-300"
                    }
                    ${!available ? "opacity-50" : ""}
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
