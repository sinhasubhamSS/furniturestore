"use client";

import React from "react";
import { useGetLatestProductsQuery } from "@/redux/services/user/publicProductApi";

const TrendingSection = () => {
  const { data, isLoading, error } = useGetLatestProductsQuery();

  // -------- PRICE CALCULATION ----------
  const getPriceInfo = (product: any) => {
    const hasDiscount = product.hasDiscount;
    const original = product.price;
    const final = hasDiscount ? product.discountedPrice : original;

    const discountPercent = hasDiscount
      ? Math.round(((original - final) / original) * 100)
      : 0;

    return { hasDiscount, original, final, discountPercent };
  };

  // -------- PRICE COMPONENT ----------
  const PriceComponent = ({
    hasDiscount,
    original,
    final,
    discountPercent,
    isMobile = false,
  }: any) => (
    <div className="mt-2 flex flex-col leading-tight">
      {/* PRICE ROW - overflow fix with flex-wrap */}
      <div className="flex flex-wrap items-center gap-1">
        {/* FINAL PRICE */}
        <span
          className={`font-bold ${
            isMobile ? "text-base" : "text-lg sm:text-xl"
          }`}
          style={{ color: "var(--color-accent)" }}
        >
          ₹{final.toLocaleString()}
        </span>

        {/* Original Price */}
        {hasDiscount && (
          <span
            className={`text-gray-400 line-through font-medium ${
              isMobile ? "text-xs" : "text-sm sm:text-base"
            }`}
          >
            ₹{original.toLocaleString()}
          </span>
        )}
      </div>

      {/* Savings text */}
      {hasDiscount && (
        <span
          className={`text-green-500 font-semibold mt-0.5 ${
            isMobile ? "text-[10px]" : "text-xs sm:text-sm"
          }`}
        >
          Save {discountPercent}% Today
        </span>
      )}
    </div>
  );

  // -------- DISCOUNT BADGE ----------
  const DiscountBadge = ({ discountPercent }: { discountPercent: number }) => (
    <span
      className="
        absolute top-2 right-2 
        bg-red-600 text-white text-[10px] sm:text-xs 
        font-bold px-2 py-1 
        rounded-full shadow-md
      "
    >
      {discountPercent}% OFF
    </span>
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="w-full h-[170px] flex items-center justify-center">
          <p className="text-[var(--color-foreground)] font-medium text-base sm:text-lg">
            Loading latest products...
          </p>
        </div>
      );
    }

    if (error || !data) {
      return (
        <div className="w-full h-[170px] flex items-center justify-center">
          <p className="text-red-500 font-semibold text-base sm:text-lg">
            Failed to load Latest Products
          </p>
        </div>
      );
    }

    return (
      <>
        {/* ----------------- MOBILE SLIDER ----------------- */}
        <div className="sm:hidden overflow-x-auto scrollbar-custom py-4 px-1">
          <div className="flex gap-4 min-w-max">
            {data.map((product: any) => {
              const { hasDiscount, original, final, discountPercent } =
                getPriceInfo(product);

              return (
                <article
                  key={product._id}
                  onClick={() =>
                    window.open(`/products/${product.slug}`, "_blank")
                  }
                  className="flex-none w-40 bg-[var(--color-card)] border border-[var(--color-border-custom)]
                    rounded-xl shadow-sm hover:shadow-lg transition cursor-pointer p-3 relative"
                >
                  {hasDiscount && (
                    <DiscountBadge discountPercent={discountPercent} />
                  )}

                  <div
                    className="h-40 w-full rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-custom)]
                    flex items-center justify-center overflow-hidden p-2"
                  >
                    <img
                      src={product.image || "/images/placeholder.jpg"}
                      alt={product.slug}
                      className="object-contain h-full w-full transition-transform duration-300 hover:scale-110"
                      loading="lazy"
                    />
                  </div>

                  <h3
                    className="mt-3 text-base font-semibold text-[var(--color-foreground)] truncate"
                    title={product.name}
                  >
                    {product.name}
                  </h3>

                  <PriceComponent
                    hasDiscount={hasDiscount}
                    original={original}
                    final={final}
                    discountPercent={discountPercent}
                    isMobile={true}
                  />
                </article>
              );
            })}
          </div>
        </div>

        {/* ----------------- DESKTOP GRID ----------------- */}
        <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-2">
          {data.map((product: any) => {
            const { hasDiscount, original, final, discountPercent } =
              getPriceInfo(product);

            return (
              <article
                key={product._id}
                onClick={() =>
                  window.open(`/products/${product.slug}`, "_blank")
                }
                className="bg-[var(--color-card)] border border-[var(--color-border-custom)]
                  rounded-xl shadow-sm hover:shadow-lg transition cursor-pointer p-4 relative"
              >
                {hasDiscount && (
                  <DiscountBadge discountPercent={discountPercent} />
                )}

                <div
                  className="h-48 w-full rounded-md bg-[var(--color-secondary)] border border-[var(--color-border-custom)]
                  flex items-center justify-center overflow-hidden p-3"
                >
                  <img
                    src={product.image || "/images/placeholder.jpg"}
                    alt={product.slug}
                    className="object-contain h-full w-full transition-transform duration-300 hover:scale-110"
                    loading="lazy"
                  />
                </div>

                <h3
                  className="mt-4 text-lg font-semibold text-[var(--color-foreground)] truncate"
                  title={product.name}
                >
                  {product.name}
                </h3>

                <PriceComponent
                  hasDiscount={hasDiscount}
                  original={original}
                  final={final}
                  discountPercent={discountPercent}
                  isMobile={false}
                />
              </article>
            );
          })}
        </div>
      </>
    );
  };

  return (
    <section className="w-full py-6 border border-[var(--color-border-custom)] rounded-xl mt-8 bg-[var(--color-primary)] shadow-lg">
      <div className="max-w-[1440px] mx-auto px-3 sm:px-6 md:px-8">
        <div className="flex items-center justify-between mb-4">
          {/* Header with theme accent underline */}
          <h2
            className="text-2xl md:text-3xl font-extrabold text-[var(--color-foreground)] pb-1"
            style={{ borderBottom: "4px solid var(--color-accent)" }}
          >
            Latest Products
          </h2>

          <button
            onClick={() => window.open("/products", "_blank")}
            className="text-[var(--color-accent)] hover:text-[var(--text-accent)] font-semibold text-sm md:text-base transition underline"
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
