"use client";

import React, { useState } from "react";
import { DisplayProduct } from "@/types/Product";

type Props = {
  product: DisplayProduct;
};

const MAX_TITLE_LENGTH = 70;

const ProductHeader: React.FC<Props> = ({ product }) => {
  const [expanded, setExpanded] = useState(false);

  const categoryName =
    typeof product.category === "string" ? "" : (product.category?.name ?? "");

  const subtitle = product.title || "";
  const isLong = subtitle.length > MAX_TITLE_LENGTH;
  const visibleSubtitle = expanded
    ? subtitle
    : subtitle.slice(0, MAX_TITLE_LENGTH);

  return (
    <div className="space-y-1">
      {/* CATEGORY */}
      {categoryName && (
        <p className="text-xs uppercase tracking-wide text-gray-500">
          {categoryName}
        </p>
      )}

      {/* PRODUCT NAME */}
      <h1
        className="
          text-xl sm:text-2xl md:text-3xl
          font-semibold
          text-gray-900
          leading-snug
        "
      >
        {product.name}
      </h1>

      {/* SUB TITLE / SHORT DESC */}
      {subtitle && (
        <p className="text-sm text-gray-600 leading-relaxed">
          {visibleSubtitle}
          {isLong && !expanded && "…"}
          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="
                ml-1
                text-sm
                font-medium
                text-blue-600
                hover:underline
              "
            >
              {expanded ? "Read less" : "Read more"}
            </button>
          )}
        </p>
      )}
    </div>
  );
};

export default ProductHeader;
