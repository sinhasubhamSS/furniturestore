"use client";

import { useEffect, useRef, useState } from "react";
import ProductsGridClient from "./ProductsGridClient";
import ProductCardSkeleton from "./ProductCardSkeleton";
import type { DisplayProduct } from "@/types/Product";
import InfiniteLoader from "./InfiniteLoader";

interface Props {
  initialProducts: DisplayProduct[];
  totalPages: number;
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
  const [hasMore, setHasMore] = useState(1 < totalPages);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  /* 🔁 RESET on sort/category change */
  useEffect(() => {
    setItems(initialProducts);
    setPage(1);
    setHasMore(1 < totalPages);
  }, [initialProducts, sortBy, category, totalPages]);

  /* 👀 OBSERVER */
  useEffect(() => {
    if (!loadMoreRef.current || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchNext();
      },
      { rootMargin: "200px" }
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
      `${
        process.env.NEXT_PUBLIC_API_BASE_URL
      }/products/all?${params.toString()}`
    );

    const json = await res.json();
    const newProducts: DisplayProduct[] = json.data?.products ?? [];

    setItems((prev) => [...prev, ...newProducts]);
    setPage(nextPage);
    setHasMore(nextPage < totalPages);
    setLoading(false);
  };

  return (
    <>
      <ProductsGridClient products={items} />

      {/* LOADER / TRIGGER */}
      {hasMore && (
        <div ref={loadMoreRef}>
          {loading && (
            <>
              <InfiniteLoader />
              <p className="text-center text-xs text-muted-foreground mt-2">
                Loading more products…
              </p>
            </>
          )}
        </div>
      )}

      {!hasMore && (
        <p className="text-center text-sm text-muted-foreground py-6">
          No more products
        </p>
      )}
    </>
  );
}
