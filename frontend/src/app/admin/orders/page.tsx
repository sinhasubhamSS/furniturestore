"use client";

import React, { useState } from "react";
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/redux/services/admin/adminOrderapi";
import { OrderStatus } from "@/types/order";
import OrderFilters from "@/components/admin/od&rt/orders/OrderFilters";
import OrdersTable from "@/components/admin/od&rt/orders/OrdersTable";
import Pagination from "@/components/admin/od&rt/common/pagination";

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

  const { data, isLoading, refetch } = useGetAllOrdersQuery({
    page,
    limit,
    ...filters,
  });

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateOrderStatusMutation();

  const handleFiltersChange = (newFilters: Partial<AdminOrderFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleStatusUpdate = async (
    orderId: string,
    newStatus: OrderStatus
  ) => {
    try {
      await updateStatus({
        orderId,
        status: newStatus,
      }).unwrap();

      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Order Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Manage orders, update status and track deliveries
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border shadow-sm">
          <OrderFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
          />
        </div>

        {/* Orders */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-6 w-6 border-b-2 border-blue-600 rounded-full" />
              <span className="ml-3 text-gray-600">Loading orders…</span>
            </div>
          )}

          {data && (
            <>
              <OrdersTable
                orders={data.orders}
                onStatusUpdate={handleStatusUpdate}
                isUpdating={isUpdating}
              />

              <div className="border-t px-4 py-4">
                <Pagination
                  pagination={data.pagination}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}

          {data && data.orders.length === 0 && !isLoading && (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📦</div>
              <p className="text-gray-600">No orders found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
