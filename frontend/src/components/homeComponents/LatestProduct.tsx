"use client";

import React from "react";
import { useGetPublishedProductsQuery } from "@/redux/services/user/publicProductApi"; // adjust if needed
import ProductCard from "../ui/HomeCardComponent";
const LatestProduct = () => {
  const { data, isLoading, error } = useGetPublishedProductsQuery({
    page: 1,
    limit: 12,
  });

  if (isLoading) return <p className="text-center py-8">Loading products...</p>;
  if (error)
    return (
      <p className="text-center py-8 text-red-500">Failed to load products</p>
    );

  return (
    <section className="py-8 px-4">
      <h2 className="text-2xl font-semibold mb-6 text-[var(--foreground)]">
        Latest Products
      </h2>
      <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {data?.products?.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </section>
  );
};

export default LatestProduct;
