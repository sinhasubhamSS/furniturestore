// src/components/product/ProductCardSkeleton.tsx
"use client";

import React from "react";

const ProductCardSkeleton: React.FC = () => {
  return (
    <div
      className="animate-pulse group relative flex flex-col h-full rounded-md overflow-hidden border"
      style={{
        background: "var(--color-card)",
      }}
    >
      {/* IMAGE */}
      <div className="aspect-[1/1] w-full bg-gray-200" />

      {/* CONTENT */}
      <div className="flex flex-col flex-1 px-3 py-2 gap-2">
        <div className="h-4 bg-gray-300 rounded w-3/4" />
        <div className="h-3 bg-gray-200 rounded w-1/2" />

        <div className="mt-auto h-7 bg-gray-300 rounded" />
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
