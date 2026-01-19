import InfiniteProductsClient from "@/components/product/InfiniteProductsClient";
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
  sortBy?: string;
};

type PageProps = {
  searchParams?: Promise<SearchParams>;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type ProductsPayload = {
  products: DisplayProduct[];
  totalPages: number;
};

/* ================= PAGE ================= */

export default async function ProductsPage({ searchParams }: PageProps) {
  const query = (await searchParams) ?? {};

  const sortBy = query.sortBy ?? "latest";

  const params = new URLSearchParams({
    page: "1",
    limit: "12",
    sortBy,
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/all?${params.toString()}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  const json: ApiResponse<ProductsPayload> = await res.json();

  const products = json.data?.products ?? [];
  const totalPages = json.data?.totalPages ?? 1;

  return (
    <div className="min-h-[calc(100vh-64px)] py-4">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 mb-4 px-4">
        <h1 className="text-lg font-semibold">All Products</h1>

        <SortDropdownClient currentSort={sortBy} />
      </div>

      {products.length > 0 ? (
        <InfiniteProductsClient
          initialProducts={products}
  
          sortBy={sortBy}
        />
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          No products found
        </div>
      )}
    </div>
  );
}
