import ProductsGridClient from "@/components/product/ProductsGridClient";
import Pagination from "@/components/pagination/Pagination";
import SortDropdownClient from "@/components/filter/SortDropdownClient";
import type { DisplayProduct } from "@/types/Product";
import type { Metadata } from "next";

/* ================= SEO (STATIC & SAFE) ================= */

export const metadata: Metadata = {
  title: "All Products | Your Store Name",
  description:
    "Browse all products from our store. Sort by latest, price, and more.",
  robots: {
    index: true,
    follow: true,
  },
};

/* ================= API TYPES ================= */

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
/**
 * NOTE:
 * -
 */

export default async function ProductsPage({ searchParams }: any) {
  /* ---------- SAFE RUNTIME PARSING ---------- */

  const page =
    typeof searchParams?.page === "string" ? Number(searchParams.page) : 1;

  const sortBy =
    typeof searchParams?.sortBy === "string" ? searchParams.sortBy : "latest";

  const category =
    typeof searchParams?.category === "string"
      ? searchParams.category
      : undefined;

  /* ---------- DATA FETCH ---------- */

  const response = await getProducts({ page, sortBy, category });

  const products = response.data?.products ?? [];
  const totalPages = response.data?.totalPages ?? 1;

  /* ---------- UI ---------- */

  return (
    <div className="min-h-[calc(100vh-64px)] py-4">
      <div className="flex items-center justify-between gap-3 mb-4 px-4">
        <h1 className="text-lg font-semibold truncate">
          {category ? `${category} Products` : "All Products"}
        </h1>

        <SortDropdownClient currentSort={sortBy} />
      </div>

      {products.length > 0 ? (
        <ProductsGridClient products={products} />
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          No products found
        </div>
      )}

      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} />
      )}
    </div>
  );
}
