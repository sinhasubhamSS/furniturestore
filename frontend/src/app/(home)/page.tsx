// app/page.tsx
import { Metadata } from "next";
import HeroSection from "@/components/homeComponents/HeroSection";
import CategorySection from "@/components/homeComponents/CatergorySection";
import TrendingSectionClient from "@/components/homeComponents/TrendingSectionClient";

/* --------- HOMEPAGE METADATA (FINAL) --------- */
export const metadata: Metadata = {
  title: "Suvidhawood – Buy Premium Wooden Furniture in Gumla, Jharkhand",
  description:
    "Upgrade your home with premium wooden furniture in Gumla, Jharkhand. Shop beds, sofas & custom designs at Suvidhawood. Order today!",
  alternates: {
    canonical: "https://suvidhawood.com/",
  },
};

/* --------- DATA FETCH --------- */
async function getLatestProducts() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/latest`,
    { next: { revalidate: 60 } },
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
      <HeroSection />
      <div className="max-w-[1440px] mx-auto px-4">
        <CategorySection />
        <TrendingSectionClient data={products.slice(0, 6)} />
      </div>
    </>
  );
}
