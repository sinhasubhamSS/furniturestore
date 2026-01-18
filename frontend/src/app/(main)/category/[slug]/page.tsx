// app/(main)/category/[slug]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductsGridClient from "@/components/product/ProductsGridClient";
import Pagination from "@/components/pagination/Pagination";
import SortDropdownClient from "@/components/filter/SortDropdownClient";
import type { DisplayProduct } from "@/types/Product";

/* ================= TYPES ================= */

type SearchParams = {
  page?: string;
  sortBy?: string;
};

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<SearchParams>;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
};

type ProductsPayload = {
  products: DisplayProduct[];
  totalPages: number;
  totalItems: number;
};

/* ================= SEO ================= */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const title = `${slug
    .replace(/-/g, " ")
    .replace(/\b\w/g, (l) =>
      l.toUpperCase()
    )} Furniture in Gumla | Suvidhawood`;

  const description = `Buy ${slug.replace(
    /-/g,
    " "
  )} furniture in Gumla, Jharkhand from Suvidhawood by Suvidha Furniture. Premium wooden furniture at best prices.`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://suvidhawood.com/category/${slug}`,
    },
  };
}

/* ================= API ================= */

async function getCategoryProducts({
  category,
  page,
  sortBy,
}: {
  category: string;
  page: number;
  sortBy: string;
}): Promise<ApiResponse<ProductsPayload>> {

  const params = new URLSearchParams({
    page: String(page),
    limit: "12",
    sortBy,
    category,
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/all?${params.toString()}`,
    { cache: "no-store" }
  );

  if (!res.ok) throw new Error("Failed to fetch category products");

  return res.json();
}

/* ================= PAGE ================= */

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const page = Number(query.page ?? 1);
  const sortBy = query.sortBy ?? "latest";

  const response = await getCategoryProducts({
    category: slug,
    page,
    sortBy,
  });

  const products = response.data?.products ?? [];
  const totalPages = response.data?.totalPages ?? 1;

  if (products.length === 0 && page === 1) {
    notFound();
  }

  return (
    <div
      className="min-h-[calc(100vh-64px)] py-6"
      style={{ background: "var(--color-primary)" }}
    >
      {/* ===== HEADER ===== */}
      <div className="flex items-center justify-between mb-5 px-4">
        <h1 className="text-xl font-bold capitalize">
          {slug.replace(/-/g, " ")} Furniture
        </h1>
        <SortDropdownClient currentSort={sortBy} />
      </div>

      {/* ===== PRODUCTS ===== */}
      {products.length > 0 ? (
        <ProductsGridClient products={products} />
      ) : (
        <div className="text-center py-20">No products found</div>
      )}

      {/* ===== PAGINATION ===== */}
      {totalPages > 1 && (
        <Pagination currentPage={page} totalPages={totalPages} />
      )}
    </div>
  );
}
