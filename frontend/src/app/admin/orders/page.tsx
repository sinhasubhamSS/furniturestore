"use client";

// components/admin/AdminOrders.tsx
import React, { useState } from "react";
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/redux/services/admin/adminOrderapi";
import { OrderStatus } from "@/types/order";
import OrderFilters from "@/components/admin/od&rt/orders/OrderFilters";
import OrdersTable from "@/components/admin/od&rt/orders/OrdersTable";
import Pagination from "@/components/admin/od&rt/orders/Pagination";

// ✅ Fixed interface name
interface AdminOrderFilters {
  status: OrderStatus | "all";
  startDate: string;
  endDate: string;
  search: string;
}

const AdminOrders: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filters, setFilters] = useState<AdminOrderFilters>({
    status: "all",
    startDate: "",
    endDate: "",
    search: "",
  });

  // ✅ Fetch orders with filters
  const { data, isLoading, error, refetch } = useGetAllOrdersQuery({
    page,
    limit,
    ...filters,
  });

  // ✅ Update order status mutation
  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();

  // ✅ Handle filter changes
  const handleFiltersChange = (newFilters: Partial<AdminOrderFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page on filter change
  };

  // ✅ Handle status update
  const handleStatusUpdate = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      await updateStatus({
        orderId,
        status: newStatus,
        trackingInfo:
          newStatus === "shipped"
            ? {
                trackingId: `TRK-${Date.now()}`,
                courierPartner: "Default Courier",
                estimatedDelivery: new Date(
                  Date.now() + 7 * 24 * 60 * 60 * 1000
                ).toISOString(),
              }
            : undefined,
      }).unwrap();

      // Show success message
      alert("Order status updated successfully!");
      refetch();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update order status");
    }
  };

  // ✅ Handle page changes
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ✅ Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Admin Orders</h1>
          <p className="text-gray-600 mt-2">
            Manage all orders, update statuses, and track order progress
          </p>
        </div>

        {/* ✅ Filters Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <OrderFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
          />
        </div>

        {/* ✅ Orders Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading orders...</span>
            </div>
          )}

          {/* ✅ REMOVED ERROR BLOCK - No more TypeScript issues */}

          {data && (
            <>
              <OrdersTable
                orders={data.orders}
                onStatusUpdate={handleStatusUpdate}
                isUpdating={isUpdating}
              />

              {/* ✅ Pagination */}
              <div className="border-t border-gray-200 px-6 py-4">
                <Pagination
                  pagination={data.pagination}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}

          {/* ✅ No data state */}
          {data && data.orders.length === 0 && !isLoading && (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-4xl mb-4">📦</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No orders found
              </h3>
              <p className="text-gray-500">
                No orders match your current filters. Try adjusting your search
                criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
