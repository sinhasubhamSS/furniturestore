"use client";

import { useGetCategoriesQuery } from "@/redux/services/adminCategoryapi";
import CategoryCard from "../CategoryCard";
type Props = {
  onSelect?: (categoryId: string) => void;
  showSelectMode?: boolean;
};

const CategoryList = ({ onSelect, showSelectMode = false }: Props) => {
  const { data: categories, isLoading, error } = useGetCategoriesQuery();

  if (isLoading) return <p className="text-white">Loading...</p>;
  if (error) return <p className="text-red-500">Failed to load categories</p>;

  if (!categories || categories.length === 0)
    return <p>No categories found.</p>;

  return (
    <div
      className={`${
        showSelectMode
          ? "flex flex-wrap gap-2"
          : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
      }`}
    >
      {categories.map((category) => (
        <CategoryCard
          key={category._id}
          category={category}
          onClick={() => onSelect?.(category._id)}
          isCompact={showSelectMode}
        />
      ))}
    </div>
  );
};

export default CategoryList;
