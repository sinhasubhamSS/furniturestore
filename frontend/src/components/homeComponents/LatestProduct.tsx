"use client";

import React from "react";
import { useGetLatestProductsQuery } from "@/redux/services/user/publicProductApi";

const TrendingSection = () => {
  const { data, isLoading, error } = useGetLatestProductsQuery();

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
        className="flex gap-4 overflow-x-auto scrollbar-hide pb-2"
        role="list"
        aria-label="Trending products"
      >
        {data.map((product) => (
          <article
            key={product._id}
            onClick={() =>
              window.open(
                `/products/${product.slug}`,
                "_blank",
                "noopener,noreferrer"
              )
            }
            className="flex-none w-[160px] md:w-[180px] bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)]"
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
            <div className="w-full h-[130px] flex items-center justify-center bg-[var(--color-card)] rounded-t-lg overflow-hidden">
              <img
                src={product.image || "/images/placeholder.jpg"}
                alt={product.slug}
                className="h-full object-contain transition-transform duration-300 ease-in-out hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "/images/placeholder.jpg";
                }}
              />
            </div>
            <div className="p-3">
              <h3
                className="text-sm font-medium text-[var(--color-foreground)] truncate"
                title={product.slug}
              >
                {product.slug}
              </h3>
              <p className="text-[var(--color-accent)] text-base font-bold mt-1">
                ₹{product.price?.toLocaleString() || "N/A"}
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
        <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-foreground)] mb-6 select-none border-b-4 border-[var(--color-accent)] w-max pb-1">
          Trending Products
        </h2>
        {renderContent()}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default TrendingSection;
