// components/admin/orders/OrderFilters.tsx
import React from "react";
import { OrderStatus } from "@/types/order";
import GenericFilters from "@/components/admin/od&rt/common/GenericFilter";

export type OrderStatusFilter = OrderStatus | "all";

interface OrderFiltersProps {
  filters: {
    status: OrderStatusFilter;
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
// components/admin/orders/OrderFilters.tsx
const statusOptions = [
  { value: "all", label: "All Orders" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "out_for_delivery", label: "Out For Delivery" },  // ✅ ADD
  { value: "delivered", label: "Delivered" },
  { value: "refunded", label: "Refunded" },    // ✅ ADD THIS
  { value: "cancelled", label: "Cancelled" },
];


  return (
    <GenericFilters
      filters={filters}
      onFiltersChange={onFiltersChange}
      isLoading={isLoading}
      statusOptions={statusOptions}
      searchPlaceholder="Order ID, Customer Name, Phone..."
    />
  );
};

export default OrderFilters;
