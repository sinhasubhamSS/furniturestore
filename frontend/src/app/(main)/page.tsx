// app/page.tsx
import { Metadata } from "next";
import HeroSection from "@/components/homeComponents/HeroSection";
import CategorySection from "@/components/homeComponents/CatergorySection";
import TrendingSectionClient from "@/components/homeComponents/TrendingSectionClient";

/* --------- METADATA (AS IS – OK) --------- */
export const metadata: Metadata = {
  title:
    "Suvidhawood by Suvidha Furniture | Furniture Store in Gumla, Jharkhand",
  description:
    "Suvidhawood by Suvidha Furniture is a trusted wooden furniture store in Gumla, Jharkhand. Buy premium beds, sofas, almirahs, tables and custom-made furniture with quality craftsmanship since 1995.",
  alternates: {
    canonical: "https://suvidhawood.com/",
  },
};

/* --------- DATA FETCH --------- */
async function getLatestProducts() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/latest`,
    { next: { revalidate: 60 } }
  );
  const json = await res.json();
  return json.data;
}

/* --------- PAGE --------- */
export default async function HomePage() {
  const products = await getLatestProducts();
  const latestProduct = products?.[0]; // ✅ ONLY 1 PRODUCT FOR GOOGLE

  return (
    <>
      {/* 🔥 GOOGLE PRODUCT SIGNAL (JSON-LD) */}
      {latestProduct && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Product",
              name: latestProduct.name,
              image: latestProduct.image,
              description:
                latestProduct.shortDescription ||
                "Premium wooden furniture by Suvidhawood",
              brand: {
                "@type": "Brand",
                name: "Suvidhawood by Suvidha Furniture",
              },
              offers: {
                "@type": "Offer",
                url: `https://suvidhawood.com/products/${latestProduct.slug}`,
                priceCurrency: "INR",
                price: latestProduct.sellingPrice,
                availability: latestProduct.inStock
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
              },
            }),
          }}
        />
      )}

      {/* UI (AS IS – PERFECT) */}
      <HeroSection products={products.slice(0, 3)} />
      <CategorySection />
      <TrendingSectionClient data={products.slice(0, 6)} />
    </>
  );
}
