// app/(main)/category/[slug]/page.tsx

import { Metadata } from "next";
import { notFound } from "next/navigation";
import InfiniteProductsClient from "@/components/product/InfiniteProductsClient";
import SortDropdownClient from "@/components/filter/SortDropdownClient";
import type { DisplayProduct } from "@/types/Product";

/* ================= TYPES ================= */

type SearchParams = {
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
};

/* ================= SEO ================= */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const readable = slug.replace(/-/g, " ");

  return {
    title: `${readable} Furniture in Gumla | Suvidhawood`,
    description: `Buy ${readable} furniture in Gumla, Jharkhand from Suvidhawood. Premium wooden furniture at best prices.`,
    alternates: {
      canonical: `https://suvidhawood.com/category/${slug}`,
    },
  };
}

/* ================= PAGE ================= */

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const sortBy = query.sortBy ?? "latest";

  // ✅ ALWAYS FIRST PAGE (SEO SAFE)
  const paramsQuery = new URLSearchParams({
    page: "1",
    limit: "12",
    sortBy,
    category: slug,
  });

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/all?${paramsQuery.toString()}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    throw new Error("Failed to fetch category products");
  }

  const json: ApiResponse<ProductsPayload> = await res.json();
  const products = json.data?.products ?? [];

  if (products.length === 0) {
    notFound();
  }

  return (
    <div
      className="min-h-[calc(100vh-64px)] py-6"
      style={{ background: "var(--color-primary)" }}
    >
      {/* HEADER */}
      <div className="flex items-center justify-between mb-5 px-4">
        <h1 className="text-xl font-bold capitalize">
          {slug.replace(/-/g, " ")} Furniture
        </h1>

        <SortDropdownClient currentSort={sortBy} />
      </div>

      {/* INFINITE PRODUCTS */}
      <InfiniteProductsClient
        initialProducts={products}
        sortBy={sortBy}
        category={slug}
      />
    </div>
  );
}
