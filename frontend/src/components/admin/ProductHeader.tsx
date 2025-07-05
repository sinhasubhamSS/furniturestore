"use client";
import { useRouter } from "next/navigation";

export default function ProductHeader() {
  const router = useRouter();

  return (
    <div className="flex items-center justify-between border-b pb-4 mb-6">
      {/* Left: Title */}
      <h1 className="text-2xl font-semibold text-[var(--text-accent)]">
        All Products
      </h1>

      {/* Right: Button + Filter */}
      <div className="flex items-center gap-3">
        {/* Filter Dropdown */}
        <select className="border rounded px-3 py-1 text-sm bg-[var(--card-bg)] text-[var(--foreground)]">
          <option value="all">All</option>
          <option value="today">Today</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>

        {/* Add Product Button */}
        <button
          onClick={() => router.push("/admin/products/add")}
          className="bg-[var(--color-accent)] text-[var(--text-light)] text-sm px-4 py-2 rounded hover:opacity-90"
        >
          + Add Product
        </button>
      </div>
    </div>
  );
}
