import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";

// ✅ Clean imports - only what you actually use
import { OrderStatus } from "@/types/order";
import { AdminOrder, AdminOrderListResponse } from "@/types/adminorder";

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["AdminOrders"],
  endpoints: (builder) => ({
    // ✅ ORDER MANAGEMENT - Perfect implementation
    getAllOrders: builder.query<
      AdminOrderListResponse,
      { 
        page?: number; 
        limit?: number; 
        status?: OrderStatus | 'all';
        startDate?: string;
        endDate?: string;
        search?: string;
      }
    >({
      query: ({ page = 1, limit = 20, status, startDate, endDate, search }) => {
        let url = `/order/admin/all?page=${page}&limit=${limit}`;
        if (status && status !== 'all') url += `&status=${status}`;
        if (startDate) url += `&startDate=${startDate}`;
        if (endDate) url += `&endDate=${endDate}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        return { url, method: "GET" };
      },
      transformResponse: (response: any) => response.data,
      providesTags: ["AdminOrders"],
    }),

    updateOrderStatus: builder.mutation<
      { order: AdminOrder },
      { orderId: string; status: OrderStatus; trackingInfo?: any }
    >({
      query: ({ orderId, status, trackingInfo }) => ({
        url: `/order/admin/${orderId}/status`,
        method: "PUT",
        data: { status, trackingInfo },
      }),
      invalidatesTags: ["AdminOrders"],
    }),
  }),
});

export const {
  useGetAllOrdersQuery,
  useUpdateOrderStatusMutation,
} = adminApi;
