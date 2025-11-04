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
  const [searchText, setSearchText] = useState("");

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
    if (!searchText) return data.products;
    return data.products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.category?.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, searchText]);

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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 text-base">Loading products...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <p className="text-red-600 text-lg font-semibold">Failed to load products</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] w-full py-4 px-3 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h1 className="text-lg font-semibold text-gray-800">
          Showing results for {selectedCategoryName || "All Products"}
        </h1>
        <SortDropdown currentSort={sortFromUrl} onSortChange={handleSortChange} />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 h-full">
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Link key={product._id} href={`/products/${product.slug}`} className="block h-full">
              <ProductCardListing product={product} />
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-20 text-gray-600 text-lg font-medium">
            No products found
          </div>
        )}
      </div>

      {/* Pagination */}
      {(data?.totalPages || 1) > 1 && filteredProducts.length > 0 && (
        <div className="flex justify-center gap-4 mt-6">
          <Button
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            disabled={page === 1}
            variant="outline"
          >
            ← Previous
          </Button>
          <span className="self-center text-gray-700 font-medium">
            Page {page} of {data?.totalPages || 1}
          </span>
          <Button
            onClick={() => setPage((p) => Math.min(p + 1, data?.totalPages || 1))}
            disabled={page === (data?.totalPages || 1)}
            variant="outline"
          >
            Next →
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
