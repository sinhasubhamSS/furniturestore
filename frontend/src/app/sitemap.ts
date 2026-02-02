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
  ];
}
