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
      {/* 🔥 SEO STATIC SECTION (hidden for users, visible for Google) */}
      <section className="sr-only">
        <h1>Suvidhawood  Furniture Store in Gumla, Jharkhand</h1>
        <p>
           Suvidha Furniture (Suvidhawood)
            is a trusted wooden furniture manufacturer and
          seller in Gumla, Jharkhand. We offer beds, almirahs, sofas, tables,
          and custom-made premium furniture at affordable prices.
        </p>
        <p>Gumla, Jharkhand. Phone: 09334265348</p>
      </section>

      {/* Visible UI */}
      <HeroSection products={products.slice(0, 3)} />
      <CategorySection />
      <TrendingSectionClient data={products.slice(0, 6)} />
    </>
  );
}
