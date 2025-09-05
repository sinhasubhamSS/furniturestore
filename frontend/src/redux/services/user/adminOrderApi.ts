// redux/services/admin/adminReturnApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { ReturnStatus } from "@/types/return";

export type ReturnStatusFilter = ReturnStatus | "all";

export interface AdminReturn {
  _id: string;
  returnId: string;
  orderId: string;
  user: {
    name: string;
    email: string;
    mobile?: string;
  };
  returnItems: any[];
  returnReason: string;
  refundAmount: number;
  status: ReturnStatus;
  requestedAt: string;
  processedAt?: string;
  refundProcessedAt?: string;
}

export interface AdminReturnListResponse {
  returns: AdminReturn[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const adminReturnApi = createApi({
  reducerPath: "adminReturnApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["AdminReturns"],
  endpoints: (builder) => ({
    getAllReturns: builder.query<
      AdminReturnListResponse,
      {
        page?: number;
        limit?: number;
        status?: ReturnStatusFilter;
        startDate?: string;
        endDate?: string;
        search?: string;
      }
    >({
      query: ({ page = 1, limit = 20, status, startDate, endDate, search }) => {
        let url = `/returns/admin/all?page=${page}&limit=${limit}`;
        if (status && status !== "all") url += `&status=${status}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        return { url, method: "GET" };
      },
      transformResponse: (response: any) => response.data,
      providesTags: ["AdminReturns"],
    }),

    updateReturnStatus: builder.mutation<
      { return: AdminReturn },
      { returnId: string; status: ReturnStatus; adminNotes?: string }
    >({
      query: ({ returnId, status, adminNotes }) => ({
        url: `/returns/${returnId}/status`,
        method: "PUT",
        data: { status, adminNotes },
      }),
      invalidatesTags: ["AdminReturns"],
    }),
  }),
});

export const {
  useGetAllReturnsQuery,
  useUpdateReturnStatusMutation,
} = adminReturnApi;
