// components/admin/AdminReturns.tsx
"use client";

import React, { useState } from "react";
import {
  useGetAllReturnsQuery,
  useUpdateReturnStatusMutation,
} from "@/redux/services/admin/adminReturnapi";
import { ReturnStatus } from "@/types/return";
import ReturnFilters from "@/components/admin/od&rt/returns/ReturnFilters";
import ReturnTable from "@/components/admin/od&rt/returns/ReturnTable";
import Pagination from "@/components/admin/od&rt/common/pagination";

interface AdminReturnFilters {
  status: ReturnStatus | "all";
  startDate: string;
  endDate: string;
  search: string;
}

const AdminReturns: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [filters, setFilters] = useState<AdminReturnFilters>({
    status: "all",
    startDate: "",
    endDate: "",
    search: "",
  });

  const { data, isLoading, error, refetch } = useGetAllReturnsQuery({
    page,
    limit,
    ...filters,
  });

  const [updateStatus, { isLoading: isUpdating }] = useUpdateReturnStatusMutation();

  const handleFiltersChange = (newFilters: Partial<AdminReturnFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleStatusUpdate = async (returnId: string, newStatus: ReturnStatus) => {
    try {
      await updateStatus({
        returnId,
        status: newStatus,
        adminNotes: `Status updated to ${newStatus} by admin`,
      }).unwrap();

      alert("Return status updated successfully!");
      refetch();
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Failed to update return status");
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Return Management</h1>
          <p className="text-gray-600 mt-2">
            Manage return requests, approve/reject returns, and process refunds
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <ReturnFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
          />
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading returns...</span>
            </div>
          )}

          {data && (
            <>
              <ReturnTable
                returns={data.returns}
                onStatusUpdate={handleStatusUpdate}
                isUpdating={isUpdating}
              />

              <div className="border-t border-gray-200 px-6 py-4">
                <Pagination
                  pagination={data.pagination}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}

          {data && data.returns.length === 0 && !isLoading && (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-4xl mb-4">🔄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No returns found
              </h3>
              <p className="text-gray-500">
                No returns match your current filters. Try adjusting your search criteria.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReturns;
