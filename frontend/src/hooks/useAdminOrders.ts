// hooks/useAdminOrders.ts
import { useState, useEffect } from "react";
import {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} from "@/redux/services/admin/adminOrderapi";
import { OrderStatus } from "@/types/order";

export const useAdminOrders = () => {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: "all" as OrderStatus | "all",
    startDate: "",
    endDate: "",
    search: "",
  });

  const ordersQuery = useGetAllOrdersQuery({
    page,
    limit: 20,
    ...filters,
  });

  const [updateStatus, statusMutation] = useUpdateOrderStatusMutation();

  const handleFiltersChange = (newFilters: Partial<typeof filters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
    try {
      await updateStatus({ orderId, status }).unwrap();
      return { success: true };
    } catch (error) {
      return { success: false, error };
    }
  };

  return {
    // Data
    orders: ordersQuery.data?.orders || [],
    pagination: ordersQuery.data?.pagination,

    // State
    page,
    filters,

    // Actions
    setPage,
    handleFiltersChange,
    handleStatusUpdate,
    refetch: ordersQuery.refetch,

    // Loading states
    isLoading: ordersQuery.isLoading,
    isUpdating: statusMutation.isLoading,
    error: ordersQuery.error,
  };
};
