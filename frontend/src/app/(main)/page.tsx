import HeroSection from "@/components/homeComponents/HeroSection";
import CategorySection from "@/components/homeComponents/CatergorySection";
import TrendingSectionClient from "@/components/homeComponents/TrendingSectionClient";

async function getLatestProducts() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/latest`,
    { next: { revalidate: 60 } }
  );

  const json = await res.json();
  return json.data;
}

export default async function HomePage() {
  const products = await getLatestProducts();

  return (
    <>
      <HeroSection products={products.slice(0, 3)} />
      <CategorySection /> {/* ✅ NO PROPS */}
      <TrendingSectionClient data={products.slice(0, 6)} />
    </>
  );
}
