"use client";

import Link from "next/link";
import { homeProduct } from "@/types/Product";

interface Props {
  data?: homeProduct[];
}

/* ---------- SKELETON CARD ---------- */
function SkeletonCard() {
  return (
    <div className="bg-[--color-card] border border-[--color-border-custom] rounded-xl p-2 sm:p-3 lg:p-4 animate-pulse">
      <div className="h-32 sm:h-36 lg:h-44 bg-gray-300/40 rounded mb-3" />
      <div className="h-3 sm:h-4 bg-gray-300/40 rounded mb-2" />
      <div className="h-3 w-2/3 bg-gray-300/40 rounded" />
    </div>
  );
}

export default function TrendingSectionClient({ data }: Props) {
  const products = data ?? [];

  return (
    <section className="w-full py-10 bg-[--color-primary]">
      <div className="max-w-[1440px] mx-auto px-4">
        {/* ---------- HEADER ---------- */}
        <div className="flex items-end justify-between mb-6">
          <h2 className="relative text-xl sm:text-2xl lg:text-3xl font-extrabold">
            Latest Products
            <span className="absolute left-0 -bottom-1 h-1 w-16 bg-[var(--color-accent)] rounded" />
          </h2>

          <Link
            href="/products"
            className="text-[var(--color-accent)] font-semibold text-sm hover:underline"
          >
            View All →
          </Link>
        </div>

        {/* ---------- MOBILE + TABLET (SCROLL ENABLED) ---------- */}
        <div className="lg:hidden overflow-x-auto scrollbar-custom">
          <div className="flex gap-3 sm:gap-4 min-w-max pb-3">
            {!data &&
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-36 sm:w-40">
                  <SkeletonCard />
                </div>
              ))}

            {products.map((p) => (
              <div key={p._id} className="w-36 sm:w-40">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </div>

        {/* ---------- DESKTOP (>=1024px, ONE ROW, MAX 6, NO SCROLL) ---------- */}
        <div className="hidden lg:grid grid-cols-6 gap-5">
          {!data &&
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

          {products.slice(0, 6).map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- PRODUCT CARD ---------- */
function ProductCard({ product }: { product: homeProduct }) {
  const {
    name,
    slug,
    image,
    listingPrice,
    sellingPrice,
    discountPercent = 0,
    savings = 0,
    inStock = true,
  } = product;

  return (
    <Link
      href={`/products/${slug}`}
      className="
        relative
        flex flex-col
        h-full
        bg-[--color-card]
        border border-[--color-border-custom]
        rounded-xl
        p-2 sm:p-3 lg:p-4
        transition
        hover:shadow-lg
        hover:-translate-y-0.5
      "
    >
      {/* DISCOUNT (ALWAYS VISIBLE) */}
      {discountPercent > 0 && (
        <span className="absolute top-2 right-2 z-10 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded">
          {discountPercent}% OFF
        </span>
      )}

      {/* IMAGE */}
      <div className="h-32 sm:h-36 lg:h-44 flex items-center justify-center bg-white border rounded mb-2 overflow-hidden">
        <img
          src={image || "/placeholder.png"}
          alt={name}
          className="object-contain h-full w-full"
          loading="lazy"
        />
      </div>

      {/* NAME */}
      <h3 className="text-xs sm:text-sm lg:text-base font-semibold truncate mb-1">
        {name}
      </h3>

      {/* PRICE */}
      <div className="mt-auto text-xs sm:text-sm lg:text-base">
        <span className="font-bold text-[var(--color-accent)]">
          ₹{sellingPrice?.toLocaleString()}
        </span>

        {listingPrice && listingPrice > (sellingPrice ?? 0) && (
          <span className="ml-2 text-[10px] sm:text-xs line-through text-gray-400">
            ₹{listingPrice.toLocaleString()}
          </span>
        )}

        {savings > 0 && (
          <div className="text-[10px] sm:text-xs font-medium text-green-600">
            You save ₹{savings.toLocaleString()}
          </div>
        )}
      </div>

      {/* STOCK */}
      {!inStock && (
        <div className="text-[10px] sm:text-xs text-red-500 mt-1">
          Out of stock
        </div>
      )}
    </Link>
  );
}
