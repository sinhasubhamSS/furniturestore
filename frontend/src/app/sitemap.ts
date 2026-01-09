import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://suvidhawood.com/",
      lastModified: new Date(),
      priority: 1,
    },
    {
      url: "https://suvidhawood.com/about",
      lastModified: new Date(),
      priority: 0.8,
    },
  ];
}
