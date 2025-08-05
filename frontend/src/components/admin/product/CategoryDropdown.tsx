"use client";

import { useEffect, useState } from "react";

type Category = {
  _id: string;
  name: string;
};

type Props = {
  value: string;
  onChange: (categoryId: string) => void;
};

const CategoryDropdown = ({ value, onChange }: Props) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch("/api/categories"); // 🔁 Adjust endpoint if needed
        const data = await res.json();
        setCategories(data.categories || []);
      } catch (error) {
        console.error("Failed to fetch categories", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="w-full">
      <label className="block mb-1 text-sm font-medium text-gray-700">
        Select Category
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-2 border border-gray-300 rounded-md"
        disabled={loading}
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
