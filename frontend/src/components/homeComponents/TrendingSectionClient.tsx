"use client";

import Link from "next/link";

interface Props {
  data?: any[];
}

/* ---------- SKELETON CARD ---------- */
function SkeletonCard() {
  return (
    <div
      className="
        flex-none
        w-40 sm:w-48 md:w-56 lg:w-60 xl:w-64
        bg-[--color-card]
        border border-[--color-border-custom]
        rounded-xl p-3
        animate-pulse
      "
    >
      <div className="h-40 sm:h-44 bg-gray-300/40 rounded mb-3" />
      <div className="h-4 bg-gray-300/40 rounded mb-2" />
      <div className="h-4 w-2/3 bg-gray-300/40 rounded" />
    </div>
  );
}

export default function TrendingSectionClient({ data }: Props) {
  const products = data?.slice(0, 6) ?? [];

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

        {/* ---------- SINGLE ROW STRIP ---------- */}
        <div className="overflow-x-auto scrollbar-custom">
          <div className="flex gap-4 min-w-max pb-2">
            {/* ---------- SKELETON ---------- */}
            {!data &&
              Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}

            {/* ---------- PRODUCTS ---------- */}
            {products.map((p) => {
              const startingPrice = p.startingPrice;
              const discountPercent = p.discountPercent ?? 0;
              const inStock = p.inStock !== false;

              return (
                <Link
                  key={p._id}
                  href={`/products/${p.slug}`}
                  className="
                    relative
                    flex-none
                    w-40 sm:w-48 md:w-56 lg:w-60 xl:w-64
                    bg-[--color-card]
                    border border-[--color-border-custom]
                    rounded-xl p-3
                    hover:shadow-lg hover:-translate-y-0.5 transition
                  "
                >
                  {/* ---------- DISCOUNT BADGE ---------- */}
                  {discountPercent > 0 && (
                    <span className="absolute top-2 right-2 bg-red-600 text-white text-[10px] px-2 py-0.5 rounded">
                      Up to {discountPercent}% OFF
                    </span>
                  )}

                  {/* ---------- IMAGE ---------- */}
                  <div className="h-40 sm:h-44 flex items-center justify-center border mb-2 bg-white rounded">
                    <img
                      src={p.image}
                      alt={p.name}
                      className="object-contain h-full w-full"
                      loading="lazy"
                    />
                  </div>

                  {/* ---------- NAME ---------- */}
                  <h3 className="text-sm font-semibold truncate mb-1">
                    {p.name}
                  </h3>

                  {/* ---------- PRICE ---------- */}
                  <div className="text-sm font-semibold text-[var(--color-accent)]">
                    Starting from ₹{startingPrice?.toLocaleString()}
                  </div>

                  {/* ---------- STOCK ---------- */}
                  {!inStock && (
                    <div className="text-xs text-red-500 mt-1">
                      Out of stock
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
