// import { MetadataRoute } from "next";

// export default function sitemap(): MetadataRoute.Sitemap {
//   return [
//     {
//       url: "https://suvidhawood.com/",
//       lastModified: new Date(),
//       priority: 1,
//     },
//     {
//       url: "https://suvidhawood.com/about",
//       lastModified: new Date(),
//       priority: 0.8,
//     },
//   ];
// }

import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://suvidhawood.com";

  // 🔹 Categories (sirf slug chahiye)
  const categoryRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/category/slugs`,
    { next: { revalidate: 3600 } }, // 1 hour cache
  );
  const categories = categoryRes.ok ? await categoryRes.json() : [];

  // 🔹 Products (sirf slug chahiye) 
  const productRes = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}/products/slugs`,
    { next: { revalidate: 3600 } },
  );
  const products = productRes.ok ? await productRes.json() : [];

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
    ...categories.map((slug: string) => ({
      url: `${baseUrl}/category/${slug}`,
      priority: 0.7,
    })),

    // // 🔹 Product pages
    // ...products.map((slug: string) => ({
    //   url: `${baseUrl}/products/${slug}`,
    //   priority: 0.9,
    // })),
  ];
}
