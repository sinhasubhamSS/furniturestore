// src/components/product/ProductCardSkeleton.tsx
"use client";

import React from "react";

const ProductCardSkeleton: React.FC = () => {
  return (
    <div
      className="animate-pulse group relative flex flex-col h-80 rounded-md overflow-hidden"
      style={{
        background: "var(--color-card)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* IMAGE SKELETON */}
      <div
        className="relative flex items-center justify-center"
        style={{ height: "56%", background: "var(--color-primary)" }}
      >
        <div className="w-3/4 h-3/4 bg-gray-300 rounded-md" />
      </div>

      {/* TEXT SKELETON */}
      <div
        className="flex-1 flex flex-col justify-between px-3 py-2"
        style={{ background: "var(--color-card-secondary)" }}
      >
        <div>
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2" />
        </div>

        <div className="flex items-center gap-2">
          <div className="h-5 bg-gray-300 rounded w-24" />
          <div className="ml-auto h-4 bg-gray-200 rounded w-16" />
        </div>
      </div>
    </div>
  );
};

export default ProductCardSkeleton;
