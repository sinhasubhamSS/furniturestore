"use client";

import React from "react";

interface SortOption {
  value: "latest" | "price_low" | "price_high" | "discount";
  label: string;
  icon: string;
}

interface SortDropdownProps {
  currentSort: string;
  onSortChange: (sortValue: string) => void;
  className?: string;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  currentSort,
  onSortChange,
  className = "",
}) => {
  const sortOptions: SortOption[] = [
    { value: "latest", label: "Newest First", icon: "🆕" },
    { value: "price_low", label: "Price: Low to High", icon: "💰" },
    { value: "price_high", label: "Price: High to Low", icon: "💸" },
    { value: "discount", label: "Best Deals", icon: "🔥" },
  ];

  return (
    <div className={`relative ${className}`}>
      <select
        value={currentSort}
        onChange={(e) => onSortChange(e.target.value)}
        className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors min-w-[200px] cursor-pointer"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.icon} {option.label}
          </option>
        ))}
      </select>

      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        <svg
          className="h-4 w-4 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </div>
    </div>
  );
};

export default SortDropdown;
