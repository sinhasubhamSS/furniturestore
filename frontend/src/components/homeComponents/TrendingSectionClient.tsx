"use client";

import Link from "next/link";
import { homeProduct } from "@/types/Product";

interface Props {
  data?: homeProduct[];
}

/* ---------- SKELETON CARD ---------- */
function SkeletonCard() {
  return (
    <div className="bg-[--color-card] border border-[--color-border-custom] rounded-xl p-3 animate-pulse">
      <div className="h-44 bg-gray-300/40 rounded mb-3" />
      <div className="h-4 bg-gray-300/40 rounded mb-2" />
      <div className="h-4 w-2/3 bg-gray-300/40 rounded" />
    </div>
  );
}

export default function TrendingSectionClient({ data }: Props) {
  const products = data ?? [];

  return (
    <section className="w-full py-8 mt-8 bg-[--color-primary]">
      <div className="max-w-[1440px] mx-auto px-4">
        {/* ---------- HEADER ---------- */}
        <div className="flex items-center justify-between mb-5">
          <h2
            className="text-2xl md:text-3xl font-extrabold"
            style={{ borderBottom: "4px solid var(--color-accent)" }}
          >
            Latest Products
          </h2>

          <Link
            href="/products"
            className="text-[var(--color-accent)] font-semibold text-sm underline"
          >
            View All →
          </Link>
        </div>

        {/* ---------- MOBILE / TABLET (SCROLL) ---------- */}
        <div className="md:hidden overflow-x-auto scrollbar-custom">
          <div className="flex gap-4 min-w-max pb-2">
            {!data &&
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-40">
                  <SkeletonCard />
                </div>
              ))}

            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </div>

        {/* ---------- DESKTOP (NO SCROLL) ---------- */}
        <div className="hidden md:grid grid-cols-3 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {!data &&
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

          {products.map((p) => (
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
    _id,
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
        bg-[--color-card]
        border border-[--color-border-custom]
        rounded-xl p-3
        hover:shadow-lg hover:-translate-y-0.5 transition
      "
    >
      {/* DISCOUNT BADGE */}
      {discountPercent > 0 && (
        <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded">
          {discountPercent}% OFF
        </span>
      )}

      {/* IMAGE */}
      <div className="h-44 flex items-center justify-center border mb-2 bg-white rounded">
        <img
          src={image || "/placeholder.png"}
          alt={name}
          className="object-contain h-full w-full"
          loading="lazy"
        />
      </div>

      {/* NAME */}
      <h3 className="text-sm font-semibold truncate mb-1">{name}</h3>

      {/* PRICE */}
      <div className="text-sm">
        <span className="font-bold text-[var(--color-accent)]">
          ₹{sellingPrice?.toLocaleString()}
        </span>

        {listingPrice && listingPrice > (sellingPrice ?? 0) && (
          <span className="ml-2 text-xs line-through text-gray-400">
            ₹{listingPrice.toLocaleString()}
          </span>
        )}
        {savings > 0 && (
          <div className="text-xs font-medium text-green-600 mt-0.5">
            You save ₹{savings.toLocaleString()}
          </div>
        )}
      </div>

      {/* STOCK */}
      {!inStock && (
        <div className="text-xs text-red-500 mt-1">Out of stock</div>
      )}
    </Link>
  );
}
