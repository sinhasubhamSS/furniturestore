// src/redux/services/adminProductApi.ts
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { AdminProductResponse } from "@/types/Product";

export const adminProductApi = createApi({
  reducerPath: "adminProductApi",
  baseQuery: fetchBaseQuery({
    baseUrl: "/api",
    credentials: "include",
  }),
  tagTypes: ["AdminProducts"],
  endpoints: (builder) => ({
    getAdminProducts: builder.query<
      AdminProductResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) =>
        `/products/admin/getallproducts?page=${page}&limit=${limit}`,

      // ✅ Just extract the inner `data` object
      transformResponse: (response: { data: AdminProductResponse }) =>
        response.data,

      providesTags: ["AdminProducts"],
    }),
  }),
});

export const { useGetAdminProductsQuery } = adminProductApi;
