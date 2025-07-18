import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { UserProductResponse } from "@/types/Product";

export const userProductApi = createApi({
  reducerPath: "userProductApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["UserProducts"],
  endpoints: (builder) => ({
    // ✅ Get all published products
    getPublishedProducts: builder.query<
      UserProductResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: `/products/published-products?page=${page}&limit=${limit}`,
        method: "GET",
      }),
      transformResponse: (res: { data: UserProductResponse }) => res.data,
      providesTags: ["UserProducts"],
    }),

    // ✅ Get single product by slug
    getProductBySlug: builder.query<UserProductResponse, string>({
      query: (slug) => ({
        url: `/products/${slug}`, // ← update endpoint to use slug
        method: "GET",
      }),
      transformResponse: (res: { data: UserProductResponse }) => res.data,
      providesTags: (_result, _error, slug) => [
        { type: "UserProducts", id: slug },
      ],
    }),
  }),
});

export const {
  useGetPublishedProductsQuery,
  useGetProductBySlugQuery, 
} = userProductApi;
