import Link from "next/link";
import ProductCardListing from "@/components/product/ProductCardListing";
import Pagination from "@/components/pagination/Pagination";
import SortDropdownClient from "@/components/filter/SortDropdownClient";
import type { DisplayProduct } from "@/types/Product";

/* ================= TYPES ================= */

type SearchParams = {
  page?: string;
  sortBy?: string;
  category?: string;
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

type Props = {
  searchParams: Promise<SearchParams>; // ✅ Next.js 15 requirement
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
    { cache: "no-store" } // ✅ pure SSR
  );

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
 const data = await res.json();
  return data;
}

/* ================= PAGE ================= */

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;

  const page = Number(params.page ?? 1);
  const sortBy = params.sortBy ?? "latest";
  const category = params.category;

  const response = await getProducts({ page, sortBy, category });

  // ✅ SAFE UNWRAP
  const products: DisplayProduct[] = response.data?.products ?? [];
  const totalPages: number = response.data?.totalPages ?? 1;

  return (
    <div
      className="min-h-[calc(100vh-64px)] py-4"
      style={{ background: "var(--color-primary)" }}
    >
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between gap-3 mb-4 px-4">
        <h1 className="text-lg font-semibold truncate">
          {category ?? "All Products"}
        </h1>

        <SortDropdownClient currentSort={sortBy} />
      </div>

      {/* ================= PRODUCTS ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-[1px] px-4">
        {products.length > 0 ? (
          products.map((product) => (
            <Link
              key={product._id}
              href={`/products/${product.slug}`}
              className="block h-full"
            >
              <ProductCardListing product={product} />
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-20">
            No products found
          </div>
        )}
      </div>

      {/* ================= PAGINATION ================= */}
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} />
      )}
    </div>
  );
}
