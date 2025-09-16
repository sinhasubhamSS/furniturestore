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
      <>
        {/* Mobile: horizontal scroll slider with smaller cards */}
        <div className="sm:hidden overflow-x-auto scrollbar-custom py-4 px-1">
          <div className="flex gap-3 min-w-max">
            {data.map((product) => (
              <article
                key={product._id}
                onClick={() =>
                  window.open(`/products/${product.slug}`, "_blank", "noopener,noreferrer")
                }
                className="flex-none w-36 bg-[var(--color-card)] border border-[var(--color-border-custom)] rounded-xl shadow-sm hover:shadow-lg cursor-pointer p-2"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    window.open(`/products/${product.slug}`, "_blank", "noopener,noreferrer");
                  }
                }}
              >
                <div className="h-40 w-full p-2 border border-[var(--color-border-custom)] rounded-md flex items-center justify-center bg-[var(--color-secondary)] overflow-hidden">
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

                <h3
                  className="mt-2 text-base font-semibold text-[var(--color-foreground)] truncate"
                  title={product.slug}
                >
                  {product.slug}
                </h3>
                <p className="mt-1 text-[var(--color-accent)] font-bold text-base">
                  ₹{product.price?.toLocaleString() || "N/A"}
                </p>
              </article>
            ))}
          </div>
        </div>

        {/* Medium and larger screens: grid layout maximized */}
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-1 max-w-[1440px] px-1">
          {data.map((product) => (
            <article
              key={product._id}
              onClick={() =>
                window.open(`/products/${product.slug}`, "_blank", "noopener,noreferrer")
              }
              className="bg-[var(--color-card)] border border-[var(--color-border-custom)] rounded-xl shadow-sm hover:shadow-lg cursor-pointer p-4"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  window.open(`/products/${product.slug}`, "_blank", "noopener,noreferrer");
                }
              }}
            >
              <div className="h-44 w-full rounded-md border border-[var(--color-border-custom)] overflow-hidden bg-[var(--color-secondary)] flex items-center justify-center p-2">
                <img
                  src={product.image || "/images/placeholder.jpg"}
                  alt={product.slug}
                  className="object-contain max-h-full max-w-full transition-transform duration-300 ease-in-out group-hover:scale-110"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "/images/placeholder.jpg";
                  }}
                />
              </div>

              <h3
                className="mt-4 text-lg font-semibold text-[var(--color-foreground)] truncate"
                title={product.slug}
              >
                {product.slug}
              </h3>
              <p className="mt-2 text-[var(--color-accent)] font-bold text-xl">
                ₹{product.price?.toLocaleString() || "N/A"}
              </p>
            </article>
          ))}
        </div>
      </>
    );
  };

  return (
    <section className="w-full py-4 border border-[var(--color-border-custom)] rounded-xl mt-8 bg-[var(--color-primary)] shadow-lg">
      {/* Responsive container with max width for big screens */}
      <div className="max-w-[1440px] mx-auto px-2 sm:px-4 md:px-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-foreground)] select-none border-b-4 border-[var(--color-accent)] w-max pb-1">
            Latest Products
          </h2>

          <button
            onClick={() => window.open("/products", "_blank")}
            className="text-[var(--color-accent)] hover:text-[var(--text-accent)] font-semibold text-sm md:text-base transition-colors duration-200 hover:underline"
          >
            View All 
          </button>
        </div>
        {renderContent()}
      </div>
    </section>
  );
};

export default TrendingSection;
