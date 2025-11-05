"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import ProductCardListing from "@/components/product/ProductCardListing";
import { useGetPublishedProductsQuery } from "@/redux/services/user/publicProductApi";
import { useGetCategoriesQuery } from "@/redux/services/admin/adminCategoryapi";
import Link from "next/link";
import Button from "@/components/ui/Button";
import SortDropdown from "@/components/filter/SortDropdown";

const ProductsPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const categoryFromUrl = searchParams.get("category") || "";
  const sortFromUrl = searchParams.get("sortBy") || "latest";
  const [page, setPage] = useState(1);

  const apiFilters = useMemo(() => {
    const filters: any = {};
    if (categoryFromUrl) filters.category = categoryFromUrl;
    return filters;
  }, [categoryFromUrl]);

  const { data, isLoading, isError } = useGetPublishedProductsQuery({
    page,
    limit: 12,
    filter: apiFilters,
    sortBy: sortFromUrl as "latest" | "price_low" | "price_high" | "discount",
  });

  const { data: categories } = useGetCategoriesQuery();

  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];
    return data.products;
  }, [data]);

  const selectedCategoryName = useMemo(() => {
    if (!categoryFromUrl || !categories) return null;
    const category = categories.find((cat) => cat.slug === categoryFromUrl);
    return category?.name || null;
  }, [categoryFromUrl, categories]);

  const updateURL = (params: { [key: string]: string | null }) => {
    const current = new URLSearchParams(Array.from(searchParams.entries()));
    Object.entries(params).forEach(([key, value]) => {
      if (value) current.set(key, value);
      else current.delete(key);
    });
    const search = current.toString();
    const query = search ? `?${search}` : "";
    router.replace(`${pathname}${query}`, { scroll: false });
  };

  const handleSortChange = (sortValue: string) => {
    updateURL({ sortBy: sortValue });
    setPage(1);
  };

  const clearCategoryFilter = () => {
    updateURL({ category: null });
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-primary)" }}>
        <div className="animate-spin rounded-full h-10 w-10 border-b-4" style={{ borderColor: "var(--color-accent)" }} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--color-primary)" }}>
        <div className="text-center">
          <div className="text-red-500 text-4xl mb-3">⚠️</div>
          <p className="text-red-600 text-lg font-semibold">Failed to load products</p>
          <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 rounded-md" style={{ background: "var(--color-accent)", color: "var(--text-light)" }}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: "var(--color-primary)" }} className="min-h-[calc(100vh-64px)] py-6 px-0">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h1 className="text-lg font-semibold" style={{ color: "var(--text-dark)" }}>
              {selectedCategoryName || "All Products"}
            </h1>
            {/* <p className="text-sm" style={{ color: "var(--text-accent)" }}>
              {data?.totalResults ?? data?.products?.length ?? 0} results
            </p> */}
          </div>

          <div className="flex items-center gap-2 px-4">
            <SortDropdown currentSort={sortFromUrl} onSortChange={handleSortChange} />
          </div>
        </div>

        {/* Category chips */}
        {/* {categories?.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-2 px-4">
            {categories.slice(0, 8).map((c: any) => (
              <button
                key={c._id}
                onClick={() => updateURL({ category: c.slug, page: "1" })}
                className="px-3 py-1 text-sm rounded-md border"
                style={
                  categoryFromUrl === c.slug
                    ? { background: "var(--color-accent)", color: "var(--text-light)", borderColor: "var(--color-border-custom)" }
                    : { background: "var(--color-card)", color: "var(--text-accent)", borderColor: "var(--color-border-custom)" }
                }
              >
                {c.name}
              </button>
            ))}
            {categoryFromUrl && (
              <button onClick={clearCategoryFilter} className="px-3 py-1 text-sm rounded-md" style={{ background: "var(--color-card-secondary)", color: "var(--text-dark)", border: "1px solid var(--color-border-custom)" }}>
                Clear category
              </button>
            )}
          </div>
        )} */}

        {/* GRID: gap 0 between items */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-0 px-4">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <Link key={product._id} href={`/products/${product.slug}`} className="block h-full">
                {/* remove internal padding to let cards touch each other horizontally */}
                <div className="h-full">
                  <ProductCardListing product={product} />
                </div>
              </Link>
            ))
          ) : (
            <div className="col-span-full text-center py-20" style={{ color: "var(--text-accent)" }}>
              No products found
            </div>
          )}
        </div>

        {/* Pagination */}
        {(data?.totalPages || 1) > 1 && filteredProducts.length > 0 && (
          <div className="flex justify-center gap-3 mt-6">
            <Button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1} variant="outline">← Previous</Button>
            <span className="self-center" style={{ color: "var(--text-dark)" }}>Page {page} of {data?.totalPages || 1}</span>
            <Button onClick={() => setPage((p) => Math.min(p + 1, data?.totalPages || 1))} disabled={page === (data?.totalPages || 1)} variant="outline">Next →</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
