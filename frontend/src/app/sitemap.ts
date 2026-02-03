import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://suvidhawood.com";

  // 🔹 Categories (sirf slug chahiye)
  const categoryRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/category/slugs`,
    { next: { revalidate: 3600 } },
  );

  const categories: string[] = categoryRes.ok
    ? (await categoryRes.json()).data // 🔥 THIS WAS MISSING
    : [];
  const productRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/slugs`,
    { next: { revalidate: 3600 } },
  );

  const products: string[] = productRes.ok
    ? (await productRes.json()).data
    : [];

  return [
    // 🔹 Static pages
    {
      url: `${baseUrl}/`,
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/products`,
      priority: 0.9,
    },

    // 🔹 Category pages
    ...categories.map((slug) => ({
      url: `${baseUrl}/category/${slug}`,
      priority: 0.7,
    })),
    ...products.map((slug) => ({
      url: `${baseUrl}/products/${slug}`,
      priority: 0.9,
    })),
  ];
}
