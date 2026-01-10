// app/page.tsx
import { Metadata } from "next";
import HeroSection from "@/components/homeComponents/HeroSection";
import CategorySection from "@/components/homeComponents/CatergorySection";
import TrendingSectionClient from "@/components/homeComponents/TrendingSectionClient";

/* --------- HOMEPAGE METADATA (YAHIN RAKHO) --------- */
export const metadata: Metadata = {
  title:
    "Suvidhawood by Suvidha Furniture | Furniture Store in Gumla, Jharkhand",

  description:
    "Suvidhawood by Suvidha Furniture is a trusted wooden furniture store in Gumla, Jharkhand. Buy premium beds, sofas, almirahs, tables and custom-made furniture with quality craftsmanship since 1995.",
  keywords: [
    "Suvidhawood",
    "Suvidha Furniture",
    "Furniture Store in Gumla",
    "Wooden Furniture Gumla",
    "Furniture Shop Near Me",
    "Solid Teak Wood Bed",
    "Gamhar Wood Furniture",
    "Sofa Set Gumla",
    "Almirah Furniture Gumla",
    "Custom Furniture Gumla",
    "Furniture Manufacturer Jharkhand",
  ],

  alternates: {
    canonical: "https://suvidhawood.com/",
  },

  openGraph: {
    title:
      "Suvidhawood by Suvidha Furniture | Furniture Store in Gumla, Jharkhand",
    description:
      "Premium wooden furniture in Gumla, Jharkhand. Trusted craftsmanship since 1995.",
    url: "https://suvidhawood.com/",
    siteName: "Suvidhawood by Suvidha Furniture",
    type: "website",
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
      <HeroSection products={products.slice(0, 3)} />
      <CategorySection />
      <TrendingSectionClient data={products.slice(0, 6)} />
    </>
  );
}
