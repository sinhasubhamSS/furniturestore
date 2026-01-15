// app/(main)/products/page.tsx

import ProductsGridClient from "@/components/product/ProductsGridClient";
import Pagination from "@/components/pagination/Pagination";
import SortDropdownClient from "@/components/filter/SortDropdownClient";
import type { DisplayProduct } from "@/types/Product";
import type { Metadata } from "next";

/* ================= SEO ================= */

export const metadata: Metadata = {
  title: "All Products | Suvidhawood by Suvidha Furniture",
  description:
    "Browse all products from Suvidhawood. Sort by latest, price, and more.",
  robots: {
    index: true,
    follow: true,
  },
};

/* ================= TYPES ================= */

type SearchParams = {
  page?: string;
  sortBy?: string;
  category?: string;
};

type PageProps = {
  searchParams?: Promise<SearchParams>;
};

type ApiResponse<T> = {
  statusCode: number;
  success: boolean;
  message: string;
  data: T;
};

type ProductsPayload = {
  products: DisplayProduct[];
  totalPages: number;
  totalItems: number;
};

/* ================= API CALL ================= */

async function getProducts({
  page,
  sortBy,
  category,
}: {
  page: number;
  sortBy: string;
  category?: string;
}): Promise<ApiResponse<ProductsPayload>> {
  const params = new URLSearchParams({
    page: String(page),
    limit: "12",
    sortBy,
  });

  if (category) params.set("category", category);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/all?${params.toString()}`,
    { cache: "no-store" }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
}

/* ================= PAGE ================= */

export default async function ProductsPage({ searchParams }: PageProps) {
  // 🔥 NEXT.JS 15 FIX — MUST AWAIT searchParams
  const query = (await searchParams) ?? {};

  const page = Number(query.page ?? 1);
  const sortBy = query.sortBy ?? "latest";
  const category = query.category;

  const response = await getProducts({ page, sortBy, category });

  const products = response.data?.products ?? [];
  const totalPages = response.data?.totalPages ?? 1;

  return (
    <div className="min-h-[calc(100vh-64px)] py-4">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 mb-4 px-4">
        <h1 className="text-lg font-semibold truncate">
          {category ? `${category} Products` : "All Products"}
        </h1>

        <SortDropdownClient currentSort={sortBy} />
      </div>

      {/* PRODUCTS GRID */}
      {products.length > 0 ? (
        <ProductsGridClient products={products} />
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          No products found
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} />
      )}
    </div>
  );
}
