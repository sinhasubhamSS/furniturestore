"use client";
// components/admin/OrderFilters.tsx
import React from "react";
import { OrderStatus } from "@/types/order";

interface OrderFiltersProps {
  filters: {
    status: OrderStatus | "all";
    startDate: string;
    endDate: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
  isLoading: boolean;
}

const OrderFilters: React.FC<OrderFiltersProps> = ({
  filters,
  onFiltersChange,
  isLoading,
}) => {
  const statusOptions = [
    { value: "all", label: "All Orders" },
    { value: "pending", label: "Pending" },
    { value: "confirmed", label: "Confirmed" },
    { value: "shipped", label: "Shipped" },
    { value: "delivered", label: "Delivered" },
    { value: "cancelled", label: "Cancelled" },
  ];

  // ✅ Fixed handlers - Merge instead of replace
  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters, // 👈 यहाँ spread करना जरूरी है
      [key]: value,
    });
  };

  const handleClearFilters = () => {
    onFiltersChange({
      status: "all",
      startDate: "",
      endDate: "",
      search: "",
    });
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        {/* ✅ Status Filter - Fixed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            {statusOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* ✅ Start Date - Fixed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* ✅ End Date - Fixed */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* ✅ Search - Fixed */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Order ID, Customer Name, Phone..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>

        {/* ✅ Clear Button */}
        <div className="flex items-end">
          <button
            onClick={handleClearFilters}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:bg-gray-100 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderFilters;
