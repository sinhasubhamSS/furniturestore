// components/homeComponents/CategorySection.tsx

import CategorySectionClient from "./CategorySection.client";

async function getCategories() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/category`, {
    next: { revalidate: 300 }, // 5 min cache
  });

  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }

  const json = await res.json();
  return json.data; // [{ _id, name, slug, image }]
}

export default async function CategorySection() {
  const categories = await getCategories();

  return <CategorySectionClient categories={categories} />;
}
