"use client";

import { useEffect, useRef, useState } from "react";
import ProductsGridClient from "./ProductsGridClient";
import InfiniteLoader from "./InfiniteLoader";
import type { DisplayProduct } from "@/types/Product";

interface Props {
  initialProducts: DisplayProduct[];
  sortBy: string;
  category?: string;
}

/* 🔧 CONFIG */
const PAGE_LIMIT = 12;

export default function InfiniteProductsClient({
  initialProducts,
  sortBy,
  category,
}: Props) {
  const [items, setItems] = useState<DisplayProduct[]>(initialProducts);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(initialProducts.length === PAGE_LIMIT);
  const [error, setError] = useState<string | null>(null);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* 🔁 RESET on sort / category change */
  useEffect(() => {
    abortRef.current?.abort();
    setItems(initialProducts);
    setPage(1);
    setHasMore(initialProducts.length === PAGE_LIMIT);
    setError(null);
  }, [initialProducts, sortBy, category]);

  /* 👀 INTERSECTION OBSERVER */
  useEffect(() => {
    if (!loadMoreRef.current || loading || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !loading && hasMore) {
          fetchNext();
        }
      },
      {
        rootMargin: "400px",
      },
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [loading, hasMore]);

  /* 🔥 FETCH NEXT PAGE */
  const fetchNext = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    setError(null);

    const nextPage = page + 1;

    const params = new URLSearchParams({
      page: String(nextPage),
      limit: String(PAGE_LIMIT),
      sortBy,
    });

    if (category) params.set("category", category);

    try {
      abortRef.current?.abort();
      abortRef.current = new AbortController();

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/all?${params.toString()}`,
        {
          cache: "no-store",
          signal: abortRef.current.signal,
        },
      );

      if (!res.ok) {
        throw new Error("Failed to load products");
      }

      const json = await res.json();
      const newProducts: DisplayProduct[] = json.data?.products ?? [];

      setItems((prev) => [...prev, ...newProducts]);
      setPage(nextPage);
      setHasMore(newProducts.length === PAGE_LIMIT);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError("Failed to load more products. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* PRODUCTS */}
      <ProductsGridClient products={items} />

      {/* ERROR */}
      {error && (
        <p className="text-center text-xs text-red-500 mt-3">{error}</p>
      )}

      {/* LOADER */}
      {loading && (
        <>
          <InfiniteLoader />
          <p
            className="text-center text-xs text-muted-foreground mt-2"
            aria-live="polite"
          >
            Loading more products…
          </p>
        </>
      )}

      {/* OBSERVER TRIGGER */}
      {hasMore && <div ref={loadMoreRef} className="h-24" />}

      {/* END */}
      {!hasMore && (
        <p className="text-center text-sm text-muted-foreground py-6">
          No more products
        </p>
      )}
    </>
  );
}
