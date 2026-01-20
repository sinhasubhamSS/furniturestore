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
    title: `${readable} Furniture Manufacturer in Gumla, Jharkhand | SuvidhaWood`,
    description: `Buy premium ${readable} wooden furniture in Gumla, Jharkhand. Factory-direct pricing, custom sizes, and durable solid wood furniture. Delivery available across Jharkhand.`,
    alternates: {
      canonical: `https://suvidhawood.com/category/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
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

  const readable = slug.replace(/-/g, " ");
  const sortBy = query.sortBy ?? "latest";

  // ✅ SEO SAFE: Always first page
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
      {/* ================= SEO SCHEMA ================= */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            name: `${readable} Furniture`,
            url: `https://suvidhawood.com/category/${slug}`,
            areaServed: {
              "@type": "AdministrativeArea",
              name: "Gumla, Jharkhand",
            },
          }),
        }}
      />

      {/* ================= HEADER ================= */}
      <div className="px-4 mb-5">
        <h1 className="text-xl font-bold capitalize">{readable} Furniture</h1>

        {/* SEO DESCRIPTION BLOCK */}
        <p className="mt-2 text-sm text-muted-foreground max-w-3xl">
          Buy premium {readable} wooden furniture in Gumla, Jharkhand from
          SuvidhaWood. We manufacture high-quality solid wood furniture with
          custom sizes, durable materials, and factory-direct pricing. Delivery
          available across Jharkhand including Ranchi, Lohardaga, and Simdega.
        </p>

        <div className="flex justify-end mt-4">
          <SortDropdownClient currentSort={sortBy} />
        </div>
      </div>

      {/* ================= PRODUCTS ================= */}
      <InfiniteProductsClient
        initialProducts={products}
        sortBy={sortBy}
        category={slug}
      />
    </div>
  );
}
