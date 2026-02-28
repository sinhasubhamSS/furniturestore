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
    <section className="py-14 sm:py-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
          Shop by Category
        </h2>

        {categories.length > 4 && (
          <button
            onClick={() => router.push("/categories")}
            className="text-sm font-medium text-[var(--color-accent)] hover:opacity-80 transition"
          >
            View All →
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-8">
        {categories.slice(0, 6).map((cat) => (
          <div
            key={cat._id}
            onClick={() => router.push(`/category/${cat.slug}`)}
            className="relative cursor-pointer rounded-3xl overflow-hidden group transition-all duration-500 hover:shadow-2xl"
          >
            {/* Image */}
            <img
              src={cat.image.url}
              alt={cat.name}
              className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Soft Warm Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />

            {/* Content */}
            <div className="absolute bottom-5 left-5 text-white">
              <h3 className="text-lg sm:text-xl md:text-2xl font-semibold tracking-wide">
                {cat.name}
              </h3>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}