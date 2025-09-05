// components/admin/returns/ReturnFilters.tsx
import React from "react";
import GenericFilters from "@/components/admin/od&rt/common/GenericFilter";
import { ReturnStatus } from "@/types/return";

export type ReturnStatusFilter = ReturnStatus | "all";

interface ReturnFiltersProps {
  filters: {
    status: ReturnStatusFilter;
    startDate: string;
    endDate: string;
    search: string;
  };
  onFiltersChange: (filters: any) => void;
  isLoading: boolean;
}

const ReturnFilters: React.FC<ReturnFiltersProps> = ({
  filters,
  onFiltersChange,
  isLoading,
}) => {
  const statusOptions = [
    { value: "all", label: "All Returns" },
    { value: ReturnStatus.Requested, label: "Requested" },
    { value: ReturnStatus.Approved, label: "Approved" },
    { value: ReturnStatus.Rejected, label: "Rejected" },
    { value: ReturnStatus.PickedUp, label: "Picked Up" },
    { value: ReturnStatus.Received, label: "Received" },
    { value: ReturnStatus.Processed, label: "Processed" },
  ];

  return (
    <GenericFilters
      filters={filters}
      onFiltersChange={onFiltersChange}
      isLoading={isLoading}
      statusOptions={statusOptions}
      searchPlaceholder="Return ID, Order ID, Customer Name..."
    />
  );
};

export default ReturnFilters;
