// redux/services/admin/adminReturnApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { ReturnStatus, Return, ReturnStatusFilter } from "@/types/return";

export interface AdminReturn extends Return {
  user: {
    name: string;
    email: string;
    mobile?: string;
  };
  order: {
    orderId: string;
    totalAmount: number;
  };
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
    // Get all returns with filters
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

    // Update return status
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

    // Get return analytics
    getReturnAnalytics: builder.query<any, { startDate?: string; endDate?: string }>({
      query: ({ startDate, endDate }) => {
        let url = `/returns/admin/analytics`;
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (params.toString()) url += `?${params.toString()}`;
        return { url, method: "GET" };
      },
      transformResponse: (response: any) => response.data,
    }),
  }),
});

export const {
  useGetAllReturnsQuery,
  useUpdateReturnStatusMutation,
  useGetReturnAnalyticsQuery,
} = adminReturnApi;
