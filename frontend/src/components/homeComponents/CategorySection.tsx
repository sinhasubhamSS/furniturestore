"use client";

import { useGetCategoriesQuery } from "@/redux/services/admin/adminCategoryapi";
import CategoryCard from "../helperComponents/CategoryCard";


type Props = {
  onSelect?: (categoryId: string) => void;
};

const CategorySection = ({ onSelect }: Props) => {
  const { data: categories, isLoading, error } = useGetCategoriesQuery();

  if (isLoading)
    return <p className="text-[var(--foreground)]">Loading categories...</p>;
  if (error) return <p className="text-red-500">Failed to load categories</p>;
  if (!categories || categories.length === 0)
    return <p>No categories found.</p>;

  return (
    <section className="mt-10 px-4 sm:px-8 max-w-7xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-accent)] mb-4">
        Explore Categories
      </h2>

      <div className="overflow-x-auto hide-scrollbar">
        <div className="flex gap-4 pb-2">
          {categories.map((category) => (
            <div
              key={category._id}
              className="min-w-[150px] sm:min-w-[180px] max-w-[200px] flex-shrink-0"
            >
              <CategoryCard
                category={category}
                onClick={() => onSelect?.(category._id)}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
