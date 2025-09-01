"use client";

import React, { useState, useMemo } from "react";
import ProductCardListing from "@/components/product/ProductCardListing";
import { useGetPublishedProductsQuery } from "@/redux/services/user/publicProductApi";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const ProductsPage = () => {
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState("");

  const { data, isLoading, isError } = useGetPublishedProductsQuery({
    page,
    limit: 12,
  });

  const filteredProducts = useMemo(() => {
    if (!data?.products) return [];
    if (!searchText) return data.products;

    return data.products.filter(
      (product) =>
        product.name.toLowerCase().includes(searchText.toLowerCase()) ||
        product.category?.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [data, searchText]);

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
      {/* ✅ Perfectly Centered Container */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                All Products
              </h1>
              <p className="text-gray-600 text-lg">
                {filteredProducts.length > 0
                  ? `Showing ${filteredProducts.length} products${
                      searchText ? ` for "${searchText}"` : ""
                    }`
                  : "No products found"}
              </p>
            </div>

            {/* Search Bar */}
            <div className="flex gap-3 items-center w-full lg:w-auto lg:min-w-96">
              <Input
                name="search"
                type="search"
                placeholder="Search products..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="flex-1 h-12 text-lg"
              />
              <Button
                onClick={() => setSearchText("")}
           
                className="h-12 px-6"
              >
                Clear
              </Button>
            </div>
          </div>
        </div>

        {/* ✅ Product List - Full Width Cards with Perfect Spacing */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {filteredProducts.length > 0 ? (
            <div>
              {filteredProducts.map((product, index) => (
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
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-4">
                No products found
              </h3>
              <p className="text-gray-600 mb-8 text-lg">
                {searchText
                  ? `We couldn't find any products matching "${searchText}"`
                  : "No products available at the moment"}
              </p>
              {searchText && (
                <Button
                  onClick={() => setSearchText("")}
                  className="px-8 py-3 text-lg"
                >
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {(data?.totalPages || 1) > 1 && (
          <div className="bg-white rounded-xl shadow-sm p-8 mt-8">
            <div className="flex justify-center items-center space-x-6">
              <Button
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
                className="px-6 py-3"
              >
                ← Previous
              </Button>

              <span className="text-gray-700 font-medium text-lg">
                Page {page} of {data?.totalPages || 1}
              </span>

              <Button
                onClick={() =>
                  setPage((p) => Math.min(p + 1, data?.totalPages || 1))
                }
                disabled={page === (data?.totalPages || 1)}
      
                className="px-6 py-3"
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
