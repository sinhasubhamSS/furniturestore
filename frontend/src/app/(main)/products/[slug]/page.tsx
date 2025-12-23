// app/products/[slug]/page.tsx
import ProductDetailClient from "@/components/ProductDetail/ProductDetail";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function ProductSlugPage({ params }: PageProps) {
  // ✅ Next.js async params rule
  const { slug } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/slug/${slug}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    notFound();
  }

  const json = await res.json();

  // RTK me transformResponse res.data karta tha
  const product = json.data;

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} />;
}
