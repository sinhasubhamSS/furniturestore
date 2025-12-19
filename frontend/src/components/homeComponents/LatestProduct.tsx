// components/homeComponents/LatestProduct.tsx
import TrendingSectionClient from "./TrendingSectionClient";

async function getLatestProducts() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/latest`,
    {
      // ✅ SSR + cache + revalidate
      next: { revalidate: 60 }, // 60 sec
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch latest products");
  }

  const json = await res.json();
  return json.data; // backend ke according
}

export default async function LatestProduct() {
  const products = await getLatestProducts();

  return <TrendingSectionClient data={products} />;
}
