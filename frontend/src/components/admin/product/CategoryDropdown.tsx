"use client";

import { useGetCategoriesQuery } from "@/redux/services/admin/adminCategoryapi";
import { useEffect } from "react";

type Props = {
  value: string;
  onChange: (categoryId: string) => void;
};

const CategoryDropdown = ({ value, onChange }: Props) => {
  const { data: categories = [], isLoading, error } = useGetCategoriesQuery();

  useEffect(() => {
    if (error) {
      console.error("Failed to fetch categories", error);
    }
  }, [error]);

  return (
    <div className="w-full">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        Select Category
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md"
        disabled={isLoading}
      >
        <option value="">-- Choose Category --</option>
        {categories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CategoryDropdown;
