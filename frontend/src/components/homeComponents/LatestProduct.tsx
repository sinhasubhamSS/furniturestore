"use client";

import React from "react";
import { useGetLatestProductsQuery } from "@/redux/services/user/publicProductApi";

const TrendingSection = () => {
  const { data, isLoading, error } = useGetLatestProductsQuery();

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="w-full h-[170px] flex items-center justify-center">
          <p className="text-[var(--color-foreground)] font-medium text-base sm:text-lg">
            Loading trending products...
          </p>
        </div>
      );
    }

    if (error || !data) {
      return (
        <div className="w-full h-[170px] flex items-center justify-center">
          <p className="text-[var(--text-error)] font-semibold text-base sm:text-lg">
            Failed to load Latest products
          </p>
        </div>
      );
    }

    return (
      <div
        className="flex gap-2 overflow-x-auto scrollbar-custom pb-2"
        role="list"
        aria-label="Trending products"
      >
        {data.map((product) => (
          <article
            key={product._id}
            onClick={() =>
              window.open(`/products/${product.slug}`, "_blank", "noopener,noreferrer")
            }
            className="flex-none w-[140px] md:w-[160px] bg-[var(--color-card)] border border-[var(--color-border-custom)] rounded-xl shadow-sm hover:shadow-lg hover:bg-[var(--color-hover-card)] transition-all duration-300 cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] group"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                window.open(`/products/${product.slug}`, "_blank", "noopener,noreferrer");
              }
            }}
          >
            <div className="w-full h-[110px] flex items-center justify-center bg-[var(--color-secondary)] rounded-t-xl overflow-hidden p-2 border-b border-[var(--color-border-custom)]">
              <img
                src={product.image || "/images/placeholder.jpg"}
                alt={product.slug}
                className="max-h-full max-w-full object-contain transition-transform duration-300 ease-in-out group-hover:scale-110"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "/images/placeholder.jpg";
                }}
              />
            </div>

            <div className="p-2">
              <h3
                className="text-sm font-semibold text-[var(--color-foreground)] truncate"
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
    <section className="w-full py-2 border border-[var(--color-border-custom)] rounded-xl mt-8 bg-[var(--color-primary)] shadow-lg">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-foreground)] select-none border-b-4 border-[var(--color-accent)] w-max pb-1">
            Latest Products
          </h2>

          <button
            onClick={() => window.open("/products", "_blank")}
            className="text-[var(--color-accent)] hover:text-[var(--text-accent)] font-semibold text-sm md:text-base transition-colors duration-200 hover:underline"
          >
            View All →
          </button>
        </div>
        {renderContent()}
      </div>
    </section>
  );
};

export default TrendingSection;
