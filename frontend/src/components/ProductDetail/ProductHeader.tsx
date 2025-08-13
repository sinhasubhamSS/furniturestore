"use client";

import React from "react";
import { DisplayProduct } from "@/types/Product"; // Assuming your types file

type Props = {
  product: DisplayProduct;
};

const ProductHeader: React.FC<Props> = ({ product }) => {
  return (
    <div className="mb-4">
      <span className="text-[--color-accent] font-semibold text-sm uppercase tracking-wide">
        {product.category?.name || "Uncategorized"}
      </span>
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mt-1">
        {product.name}
      </h1>
      <p className="text-gray-600 mt-2">{product.title}</p>
    </div>
  );
};

export default ProductHeader;
