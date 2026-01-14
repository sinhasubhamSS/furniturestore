// app/(main)/products/page.tsx

import ProductsGridClient from "@/components/product/ProductsGridClient";
import Pagination from "@/components/pagination/Pagination";
import SortDropdownClient from "@/components/filter/SortDropdownClient";
import type { DisplayProduct } from "@/types/Product";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Products | Suvidhawood by Suvidha Furniture",
  description:
    "Browse all wooden furniture including beds, sofas, almirahs and tables from Suvidhawood by Suvidha Furniture, Gumla Jharkhand.",
  alternates: {
    canonical: "https://suvidhawood.com/products",
  },
};

type SearchParams = {
  page?: string;
  sortBy?: string;
  category?: string;
};

async function getProducts(params: SearchParams) {
  const query = new URLSearchParams({
    page: params.page ?? "1",
    limit: "12",
    sortBy: params.sortBy ?? "latest",
  });

  if (params.category) {
    query.set("category", params.category);
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/all?${query}`,
    { cache: "no-store" }
  );

  if (!res.ok) throw new Error("Failed to fetch products");
  return res.json();
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const response = await getProducts(searchParams);

  const products: DisplayProduct[] = response.data.products;
  const totalPages = response.data.totalPages;

  return (
    <div className="py-4 min-h-screen bg-[var(--color-primary)]">
      <div className="flex justify-between items-center px-4 mb-4">
        <h1 className="text-xl font-semibold">All Products</h1>
        <SortDropdownClient currentSort={searchParams.sortBy ?? "latest"} />
      </div>

      {products.length > 0 ? (
        <ProductsGridClient products={products} />
      ) : (
        <div className="text-center py-20">No products found</div>
      )}

      {totalPages > 1 && (
        <Pagination
          currentPage={Number(searchParams.page ?? 1)}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}
