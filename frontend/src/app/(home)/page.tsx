// app/page.tsx
import { Metadata } from "next";
import HeroSection from "@/components/homeComponents/HeroSection";
import CategorySection from "@/components/homeComponents/CatergorySection";
import TrendingSectionClient from "@/components/homeComponents/TrendingSectionClient";

/* --------- HOMEPAGE METADATA (FINAL) --------- */
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

  return (
    <>
      {/* 🔥 STORE / BRAND SCHEMA (CORRECT FOR HOMEPAGE) */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FurnitureStore",
            name: "Suvidhawood by Suvidha Furniture",
            url: "https://suvidhawood.com",
            description:
              "Premium wooden furniture store in Gumla, Jharkhand offering beds, sofas, almirahs and custom-made furniture.",
            address: {
              "@type": "PostalAddress",
              addressLocality: "Gumla",
              addressRegion: "Jharkhand",
              addressCountry: "IN",
            },
          }),
        }}
      />

      {/* UI (NO CHANGE – PERFECT) */}
      <HeroSection products={products.slice(0, 3)} />
      <CategorySection />
      <TrendingSectionClient data={products.slice(0, 6)} />
    </>
  );
}
