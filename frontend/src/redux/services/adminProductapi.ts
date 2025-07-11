// src/redux/services/adminProductApi.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import type { AdminProductResponse } from "@/types/Product";
import { CreateProductInput } from "@/lib/validations/product.schema";
import { axiosBaseQuery } from "../api/ustomBaseQuery";

export const adminProductApi = createApi({
  reducerPath: "adminProductApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["AdminProducts"],
  endpoints: (builder) => ({
    // 🔁 Get all products
    getAdminProducts: builder.query<
      AdminProductResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: "/products/admin/getallproducts",
        method: "GET",
        params: { page, limit },
      }),
      transformResponse: (response: { data: AdminProductResponse }) =>
        response.data,
      providesTags: ["AdminProducts"],
    }),

    // ✅ Create product
    createProduct: builder.mutation<any, CreateProductInput>({
      query: (body) => ({
        url: "/products/createproduct",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["AdminProducts"],
    }),

    // ✅ Edit product
    editProduct: builder.mutation<
      any,
      { id: string; data: CreateProductInput }
    >({
      query: ({ id, data }) => ({
        url: `/products/editproduct/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: ["AdminProducts"],
    }),
  }),
});

export const {
  useGetAdminProductsQuery,
  useCreateProductMutation,
  useEditProductMutation,
} = adminProductApi;
