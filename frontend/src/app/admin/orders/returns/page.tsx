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

  const { data, isLoading, refetch } = useGetAllReturnsQuery({
    page,
    limit,
    ...filters,
  });

  const [updateStatus, { isLoading: isUpdating }] =
    useUpdateReturnStatusMutation();

  const handleFiltersChange = (newFilters: Partial<AdminReturnFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1);
  };

  const handleStatusUpdate = async (
    returnId: string,
    newStatus: ReturnStatus
  ) => {
    try {
      await updateStatus({
        returnId,
        status: newStatus,
        adminNotes: `Status updated to ${newStatus}`,
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
            Return Management
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            Review return requests, approve, reject and process refunds
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border shadow-sm">
          <ReturnFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
            isLoading={isLoading}
          />
        </div>

        {/* Returns */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin h-6 w-6 border-b-2 border-blue-600 rounded-full" />
              <span className="ml-3 text-gray-600">
                Loading returns…
              </span>
            </div>
          )}

          {data && (
            <>
              <ReturnTable
                returns={data.returns}
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

          {data && data.returns.length === 0 && !isLoading && (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">🔄</div>
              <p className="text-gray-600">No returns found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminReturns;
