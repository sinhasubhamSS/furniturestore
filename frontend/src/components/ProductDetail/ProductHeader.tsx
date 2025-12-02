"use client";

import React, { useState } from "react";
import { DisplayProduct } from "@/types/Product";

type Props = {
  product: DisplayProduct;
};

const MAX_TITLE_LENGTH = 60;

const ProductHeader: React.FC<Props> = ({ product }) => {
  const [showFullTitle, setShowFullTitle] = useState(false);

  // ✅ Safe category name resolver (no "Uncategorized")
  const categoryName =
    typeof product.category === "string"
      ? "" // ← plain string (ID) = don't show anything
      : product.category?.name ?? "";

  // Title logic
  const title = product.title || "";
  const isLong = title.length > MAX_TITLE_LENGTH;
  const displayedTitle = showFullTitle
    ? title
    : title.slice(0, MAX_TITLE_LENGTH);

  return (
    <div className="mb-4">
      {categoryName && (
        <span className="text-[var(--text-accent)] font-medium text-sm uppercase tracking-wide">
          {categoryName}
        </span>
      )}

      <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-foreground)] mt-1 leading-tight">
        {product.name}
      </h1>

      <p className="text-[var(--text-accent)] mt-2 text-sm">
        {displayedTitle}
        {isLong && !showFullTitle && "... "}
        {isLong && (
          <button
            className="text-[var(--text-accent)] underline ml-1"
            onClick={() => setShowFullTitle(!showFullTitle)}
            type="button"
          >
            {showFullTitle ? "less" : "more"}
          </button>
        )}
      </p>
    </div>
  );
};

export default ProductHeader;
