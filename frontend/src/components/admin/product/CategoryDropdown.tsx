"use client";

import { useGetCategoriesQuery } from "@/redux/services/admin/adminCategoryapi";
import { useEffect } from "react";

type Props = {
  value: string;
  onChange: (categoryId: string) => void;
  error?: string | undefined;
};

const CategoryDropdown = ({ value, onChange, error }: Props) => {
  const {
    data: categories = [],
    isLoading,
    error: fetchError,
  } = useGetCategoriesQuery();

  useEffect(() => {
    if (fetchError) {
      console.error("Failed to fetch categories", fetchError);
    }
  }, [fetchError]);

  return (
    <div className="w-full">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        Select Category
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full p-2 rounded-md ${
          error ? "border-red-500" : "border-gray-300"
        } `}
        disabled={isLoading}
      >
        <option value="">-- Choose Category --</option>
        {categories.map((cat: any) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default CategoryDropdown;
