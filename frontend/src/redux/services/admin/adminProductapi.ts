// src/redux/services/adminProductApi.ts

import { createApi } from "@reduxjs/toolkit/query/react";
import type { AdminProductResponse } from "@/types/Product";
import { CreateProductInput } from "@/lib/validations/product.schema";
import { axiosBaseQuery } from "@/redux/api/customBaseQuery";

export const adminProductApi = createApi({
  reducerPath: "adminProductApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["AdminProducts"],
  endpoints: (builder) => ({
    // 🔁 Get all products (Admin)
    getAdminProducts: builder.query<
      AdminProductResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 }) => ({
        url: "/products/admin/all", // ✅ Updated route
        method: "GET",
        params: { page, limit },
      }),
      transformResponse: (response: { data: AdminProductResponse }) => {
        return response.data;
      },
      providesTags: ["AdminProducts"],
    }),

    getAdminProductById: builder.query<any, string>({
      query: (id) => ({
        url: `/products/admin/id/${id}`,
        method: "GET",
      }),
      transformResponse: (response: { data: any }) => response.data,
    }),

    // ✅ Create product
    createProduct: builder.mutation<any, CreateProductInput>({
      query: (body) => ({
        url: "/products/admin/create", // ✅ Updated route
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["AdminProducts"],
    }),

    // ✅ Delete product
    deleteProduct: builder.mutation<any, string>({
      query: (id) => ({
        url: `/products/admin/delete/${id}`, // ✅ Updated route
        method: "DELETE",
      }),
      invalidatesTags: ["AdminProducts"],
    }),

    // ✅ Edit product (if you implement it later)
    editProduct: builder.mutation<
      any,
      { id: string; data: CreateProductInput }
    >({
      query: ({ id, data }) => ({
        url: `/products/admin/edit/${id}`, // ✅ Updated route
        method: "PUT",
        data,
      }),
      invalidatesTags: ["AdminProducts"],
    }),
  }),
});

export const {
  useGetAdminProductsQuery,
  useGetAdminProductByIdQuery,
  useCreateProductMutation,
  useEditProductMutation,
  useDeleteProductMutation,
} = adminProductApi;
