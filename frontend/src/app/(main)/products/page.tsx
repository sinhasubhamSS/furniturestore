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
    if (categoryFromUrl) {
      filters.category = categoryFromUrl;
    }
    return filters;
  }, [categoryFromUrl]);

  // ✅ Updated API call with sortBy
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
      if (value) {
        current.set(key, value);
      } else {
        current.delete(key);
      }
    });

    const search = current.toString();
    const query = search ? `?${search}` : "";

    router.replace(`${pathname}${query}`, { scroll: false });
  };

  // ✅ Sort change handler
  const handleSortChange = (sortValue: string) => {
    updateURL({ sortBy: sortValue });
    setPage(1); // Reset to first page when sorting changes
  };

  const clearCategoryFilter = () => {
    updateURL({ category: null });
    setPage(1);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-500 mx-auto"></div>
          <p className="mt-6 text-gray-600 text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <p className="text-red-600 text-xl font-semibold">
            Failed to load products
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 py-8">
        {/* ✅ Header with Title and Sort */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl text-gray-800 font-medium">
              Showing results for {selectedCategoryName || "All Products"}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {data?.totalItems || 0} products found
            </p>
          </div>

          {/* ✅ Sort Dropdown */}
          <SortDropdown
            currentSort={sortFromUrl}
            onSortChange={handleSortChange}
            className="self-start sm:self-center"
          />
        </div>

        {/* ✅ Product List */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredProducts.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {filteredProducts.map((product) => (
                <Link
                  key={product._id}
                  href={`/products/${product.slug}`}
                  className="block hover:bg-gray-50 transition-colors"
                >
                  <ProductCardListing product={product} />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-4">
              <div className="text-6xl mb-6">🔍</div>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">
                No products found
              </h3>
              <p className="text-gray-600 mb-6">
                {searchText
                  ? `No products match "${searchText}"`
                  : selectedCategoryName
                  ? `No products in ${selectedCategoryName} category`
                  : "No products available"}
              </p>

              <div className="flex gap-3 justify-center">
                {searchText && (
                  <Button onClick={() => setSearchText("")} variant="outline">
                    Clear Search
                  </Button>
                )}
                {selectedCategoryName && (
                  <Button onClick={clearCategoryFilter} variant="outline">
                    View All Products
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ✅ Pagination */}
        {(data?.totalPages || 1) > 1 && filteredProducts.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
            <div className="flex justify-center items-center gap-6">
              <Button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                variant="outline"
              >
                ← Previous
              </Button>

              <span className="text-gray-700 font-medium">
                Page {page} of {data?.totalPages || 1}
              </span>

              <Button
                onClick={() =>
                  setPage((p) => Math.min(p + 1, data?.totalPages || 1))
                }
                disabled={page === (data?.totalPages || 1)}
                variant="outline"
              >
                Next →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
