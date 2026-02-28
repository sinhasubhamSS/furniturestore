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

  const visibleCategories = categories.slice(0, 6);

  return (
    <section className="py-12 sm:py-16">
      {/* Header */}
      <div className="flex items-center justify-between mb-10 sm:mb-12">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
          Shop by Category
        </h2>

        {categories.length > 4 && (
          <button
            onClick={() => router.push("/categories")}
            className="text-sm md:text-base font-medium text-[var(--color-accent)] hover:underline"
          >
            View All →
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
        {visibleCategories.map((cat, index) => (
          <div
            key={cat._id}
            onClick={() => router.push(`/category/${cat.slug}`)}
            className={`relative cursor-pointer rounded-2xl overflow-hidden group shadow-sm hover:shadow-lg transition-all duration-300
            ${index >= 4 ? "hidden sm:block" : ""}`}
          >
            {/* Image */}
            <img
              src={cat.image.url}
              alt={cat.name}
              className="w-full aspect-[4/3] object-cover transition-transform duration-500 group-hover:scale-105"
            />

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Title */}
            <div className="absolute bottom-5 left-5 text-white">
              <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold">
                {cat.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}