import { Metadata } from "next";
import Link from "next/link";

type Category = {
  _id: string;
  name: string;
  slug: string;
  image: {
    url: string;
  };
};

export const metadata: Metadata = {
  title: "All Furniture Categories | Suvidhawood",
  description:
    "Browse all furniture categories at Suvidhawood. Explore beds, sofas, almirahs and more premium wooden furniture in Gumla, Jharkhand.",
  alternates: {
    canonical: "https://suvidhawood.com/categories",
  },
};

async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/category`, {
    cache: "no-store",
  });

  if (!res.ok) throw new Error("Failed to fetch categories");

  const json = await res.json();
  return json.data ?? [];
}

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="max-w-[1200px] mx-auto px-4 py-12">
      <h1 className="text-3xl md:text-4xl font-bold mb-10">All Categories</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {categories.map((cat) => (
          <Link
            key={cat._id}
            href={`/category/${cat.slug}`}
            className="relative rounded-2xl overflow-hidden group shadow-sm hover:shadow-lg transition"
          >
            <img
              src={cat.image.url}
              alt={cat.name}
              className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            <div className="absolute bottom-5 left-5 text-white text-xl font-semibold">
              {cat.name}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
