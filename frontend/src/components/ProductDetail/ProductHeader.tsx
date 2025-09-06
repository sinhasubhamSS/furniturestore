"use client";

import React from "react";
import { DisplayProduct } from "@/types/Product";

type Props = {
  product: DisplayProduct;
};

const ProductHeader: React.FC<Props> = ({ product }) => {
  return (
    <div className="mb-4">
      <span className="text-[var(--text-accent)] font-medium text-sm uppercase tracking-wide">
        {product.category?.name || "Uncategorized"}
      </span>
      <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-foreground)] mt-1 leading-tight">
        {product.name}
      </h1>
      <p className="text-[var(--text-accent)] mt-2 text-sm">{product.title}</p>
    </div>
  );
};

export default ProductHeader;
