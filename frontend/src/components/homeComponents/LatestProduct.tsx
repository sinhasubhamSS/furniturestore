"use client";

import React from "react";
import { useGetPublishedProductsQuery } from "@/redux/services/user/publicProductApi";

const TrendingSection = () => {
  const { data, isLoading, error } = useGetPublishedProductsQuery({
    page: 1,
    limit: 12,
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="w-full h-[170px] flex items-center justify-center">
          <p className="text-[var(--color-foreground)] font-medium">
            Loading trending products...
          </p>
        </div>
      );
    }

    if (error || !data) {
      return (
        <div className="w-full h-[170px] flex items-center justify-center">
          <p className="text-red-600 font-semibold">
            Failed to load trending products
          </p>
        </div>
      );
    }

    return (
      <div
        className="flex gap-5 overflow-x-auto scrollbar-hide"
        role="list"
        aria-label="Trending products"
      >
        {data.products?.map((product) => (
          <article
            key={product._id}
            onClick={() =>
              window.open(
                `/products/${product.slug}`,
                "_blank",
                "noopener,noreferrer"
              )
            }
            title={product.title || product.name}
            className="flex-none w-[140px] rounded-lg cursor-pointer bg-white border border-gray-200 shadow-sm hover:shadow-lg transition-shadow duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
            role="listitem"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                window.open(
                  `/products/${product.slug}`,
                  "_blank",
                  "noopener,noreferrer"
                );
              }
            }}
          >
            <div className="w-full h-[110px] flex items-center justify-center overflow-hidden rounded-t-lg bg-[var(--color-card)]">
              <img
                src={product.images?.[0]?.url || "/images/placeholder.jpg"}
                alt={product.title || product.name}
                className="max-h-full object-contain transition-transform duration-300 ease-in-out hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "/images/placeholder.jpg";
                }}
              />
            </div>
            <div className="px-3 pt-3 pb-2 flex flex-col justify-start min-h-[60px]">
              <h3
                className="text-sm font-semibold text-[var(--color-foreground)] whitespace-normal break-words"
                title={product.title || product.name}
              >
                {product.title || product.name}
              </h3>
              <p className="mt-1 text-lg font-bold text-[var(--color-accent)]">
                ₹{product.price.toLocaleString()}
              </p>
            </div>
          </article>
        ))}
      </div>
    );
  };

  return (
    <section className="w-full py-6 border border-gray-300 rounded-xl mt-8 bg-[var(--color-primary)] shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <h2 className="text-3xl font-extrabold text-[var(--color-foreground)] mb-6 select-none border-b-4 border-[var(--color-accent)] w-max pb-1">
          Trending Products
        </h2>
        {renderContent()}
      </div>

      <style jsx>{`
        /* Hide default scrollbar */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
      `}</style>
    </section>
  );
};

export default TrendingSection;
