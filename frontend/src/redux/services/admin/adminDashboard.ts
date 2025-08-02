import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../api/customBaseQuery";
import { Order } from "@/types/order"; // Import your Order type

export interface DashboardStats {
  totalUsers: number;
  totalProducts: number;
  pendingOrdersCount: number;
  recentOrders: Order[]; // ✅ Use proper Order interface
}

export const adminDashboardApi = createApi({
  reducerPath: "adminDashboardApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["DashboardStats"],
  endpoints: (builder) => ({
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => ({
        url: "/admin/dashboard",
        method: "GET",
      }),
      transformResponse: (response: { data: DashboardStats }) => response.data,
      providesTags: ["DashboardStats"], // ✅ Cache invalidation ke liye
    }),
  }),
});

export const { useGetDashboardStatsQuery } = adminDashboardApi;
