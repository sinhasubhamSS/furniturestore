// components/homeComponents/TrendingSection.tsx
"use client";

import React from "react";
import { useGetPublishedProductsQuery } from "@/redux/services/user/publicProductApi";
import ProductCard from "../ui/HomeCardComponent";

const TrendingSection = () => {
  const { data, isLoading, error } = useGetPublishedProductsQuery({
    page: 1,
    limit: 8,
  });

  if (isLoading) {
    return (
      <section className="w-full py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-[var(--color-foreground)]">
            Trending Products
          </h2>
          <p className="text-center py-8 text-[var(--color-foreground)]">
            Loading trending products...
          </p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="w-full py-16 px-4 md:px-8 lg:px-16">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-2xl font-bold mb-8 text-[var(--color-foreground)]">
            Trending Products
          </h2>
          <p className="text-center py-8 text-red-500">
            Failed to load trending products
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full py-16 px-4 md:px-8 lg:px-16">
      <div className="max-w-[1440px] mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-[var(--color-foreground)]">
          Trending Products
        </h2>

        {/* Flipkart Style Horizontal Row */}
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {data?.products?.map((product) => (
            <div key={product._id} className="flex-none w-48 flex flex-col">
              <ProductCard product={product} variant="trending" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrendingSection;
