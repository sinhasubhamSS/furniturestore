import ProductDetailClient from "@/components/ProductDetail/ProductDetail";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/* ================= SEO METADATA ================= */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {

  const { slug } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/slug/${slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) return {};

  const json = await res.json();
  const product = json.data;

  if (!product) return {};

  return {
    title: `${product.name} | Suvidhawood by Suvidha Furniture`,
    description:
      product.shortDescription ||
      `Buy ${product.name} online in Gumla, Jharkhand from Suvidhawood by Suvidha Furniture.`,

    alternates: {
      canonical: `https://suvidhawood.com/products/${product.slug}`,
    },

    openGraph: {
      type: "website", // ✅ Next.js supported
      title: product.name,
      description:
        product.shortDescription || "Premium wooden furniture by Suvidhawood",
      url: `https://suvidhawood.com/products/${product.slug}`,
      images: [
        {
          url: product.image,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
  };
}

/* ================= PAGE ================= */
export default async function ProductSlugPage({ params }: PageProps) {
  const { slug } = await params;

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/slug/${slug}`,
    { cache: "no-store" }
  );

  if (!res.ok) notFound();

  const json = await res.json();
  const product = json.data;

  if (!product) notFound();

  return (
    <>
      {/* 🔥 PRODUCT SCHEMA FOR GOOGLE */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            image: product.image,
            description:
              product.shortDescription ||
              "Premium wooden furniture by Suvidhawood",
            brand: {
              "@type": "Brand",
              name: "Suvidhawood by Suvidha Furniture",
            },
            offers: {
              "@type": "Offer",
              url: `https://suvidhawood.com/products/${product.slug}`,
              priceCurrency: "INR",
              price: product.sellingPrice,
              availability: product.inStock
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
            },
          }),
        }}
      />

      {/* UI – unchanged */}
      <ProductDetailClient product={product} />
    </>
  );
}
