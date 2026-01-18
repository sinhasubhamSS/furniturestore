"use client";

import { useEffect, useRef, useState } from "react";
import ProductsGridClient from "./ProductsGridClient";
import InfiniteLoader from "./InfiniteLoader";
import type { DisplayProduct } from "@/types/Product";

interface Props {
  initialProducts: DisplayProduct[];
  totalPages: number; // ab sirf initial ke liye
  sortBy: string;
  category?: string;
}

export default function InfiniteProductsClient({
  initialProducts,
  totalPages,
  sortBy,
  category,
}: Props) {
  const [items, setItems] = useState<DisplayProduct[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);

  // ❗ IMPORTANT: hasMore ab response length se control hoga
  const [hasMore, setHasMore] = useState(initialProducts.length === 12);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  /* 🔁 RESET on sort / category change */
  useEffect(() => {
    setItems(initialProducts);
    setPage(1);
    setHasMore(initialProducts.length === 12);
  }, [initialProducts, sortBy, category]);

  /* 👀 INTERSECTION OBSERVER */
  useEffect(() => {
    if (!loadMoreRef.current || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading) {
          fetchNext();
        }
      },
      {
        rootMargin: "500px", // production-safe
      },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  /* 🔥 FETCH NEXT PAGE */
  const fetchNext = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPage = page + 1;

    const params = new URLSearchParams({
      page: String(nextPage),
      limit: "12",
      sortBy,
    });

    if (category) params.set("category", category);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/all?${params.toString()}`,
      { cache: "no-store" }, // 🔥 IMPORTANT
    );

    const json = await res.json();
    const newProducts: DisplayProduct[] = json.data?.products ?? [];

    console.log("Fetched page:", nextPage, newProducts.length); // ✅ debug

    setItems((prev) => [...prev, ...newProducts]);
    setPage(nextPage);

    // 🔥 FINAL hasMore LOGIC
    setHasMore(newProducts.length === 12);

    setLoading(false);
  };

  return (
    <>
      {/* PRODUCTS */}
      <ProductsGridClient products={items} />

      {/* LOADER (visual only) */}
      {loading && (
        <>
          <InfiniteLoader />
          <p className="text-center text-xs text-muted-foreground mt-2">
            Loading more products…
          </p>
        </>
      )}

      {/* OBSERVER TRIGGER (ALWAYS PRESENT, INVISIBLE) */}
      {hasMore && <div ref={loadMoreRef} className="h-24" />}

      {/* END MESSAGE */}
      {!hasMore && (
        <p className="text-center text-sm text-muted-foreground py-6">
          No more products
        </p>
      )}
    </>
  );
}
