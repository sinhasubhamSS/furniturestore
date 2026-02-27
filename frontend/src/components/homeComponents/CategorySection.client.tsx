"use client";

import { useRouter } from "next/navigation";

type Category = {
  _id: string;
  name: string;
  slug: string;
  image: {
    url: string;
  };
};

type Props = {
  categories: Category[];
};

export default function CategorySectionClient({ categories }: Props) {
  const router = useRouter();

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-12">
        <h2 className="text-3xl md:text-4xl font-bold">Shop by Category</h2>

        {categories.length > 6 && (
          <button
            onClick={() => router.push("/categories")}
            className="text-sm md:text-base font-medium text-[var(--color-accent)] hover:underline"
          >
            View All →
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
        {categories.slice(0, 6).map((cat) => (
          <div
            key={cat._id}
            onClick={() => router.push(`/category/${cat.slug}`)}
            className="relative cursor-pointer rounded-2xl overflow-hidden group shadow-sm hover:shadow-lg transition-all duration-300"
          >
            <img
              src={cat.image.url}
              alt={cat.name}
              className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            <div className="absolute bottom-6 left-6 text-white">
              <h3 className="text-2xl md:text-3xl font-semibold">{cat.name}</h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
