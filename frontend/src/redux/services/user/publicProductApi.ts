// src/redux/services/userProductApi.ts

import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import {
  DisplayProduct,
  UserProductResponse,
  ProductQueryParams,
} from "@/types/Product";

export const userProductApi = createApi({
  reducerPath: "userProductApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["UserProducts"],
  endpoints: (builder) => ({
    // ✅ Updated with filter support
    getPublishedProducts: builder.query<
      UserProductResponse,
      ProductQueryParams
    >({
      query: ({ page = 1, limit = 10, filter = {} } = {}) => ({
        url: `/products/all`,
        method: "GET",
        params: {
          page,
          limit,
          ...filter, // ✅ This spreads { category: "chairs" } to ?category=chairs
        },
      }),
      transformResponse: (res: { data: UserProductResponse }) => {
        console.log("📦 Published Products Response:", res.data);
        return res.data;
      },
      providesTags: ["UserProducts"],
    }),

    getProductBySlug: builder.query<DisplayProduct, string>({
      query: (slug) => ({
        url: `/products/slug/${slug}`,
        method: "GET",
      }),
      transformResponse: (res: { data: DisplayProduct }) => {
        console.log("📦 Product by slug response:", res.data);
        return res.data;
      },
      providesTags: (_result, _error, slug) => [
        { type: "UserProducts", id: slug },
      ],
    }),

    getProductByID: builder.query<DisplayProduct, string>({
      query: (id) => ({
        url: `/products/id/${id}`,
        method: "GET",
      }),
      transformResponse: (res: { data: DisplayProduct }) => {
        console.log("📦 Product by ID response:", res.data);
        return res.data;
      },
      providesTags: (_result, _error, id) => [{ type: "UserProducts", id }],
    }),

    getLatestProducts: builder.query<DisplayProduct[], number | void>({
      query: (limit = 8) => ({
        url: "/products/latest",
        method: "GET",
        params: { limit },
      }),
      transformResponse: (response: { data: DisplayProduct[] }) => {
        console.log("📦 Latest Products Response:", response.data);
        return response.data;
      },
    }),

    searchProducts: builder.query<
      UserProductResponse,
      { query: string; page?: number; limit?: number }
    >({
      query: ({ query: searchQuery, page = 1, limit = 10 }) => ({
        url: "/products/search",
        method: "GET",
        params: { q: searchQuery, page, limit },
      }),
      transformResponse: (res: { data: UserProductResponse }) => {
        console.log("📦 Search Results:", res.data);
        return res.data;
      },
    }),

    getProductsByCategory: builder.query<
      UserProductResponse,
      { slug: string; page?: number; limit?: number }
    >({
      query: ({ slug, page = 1, limit = 10 }) => ({
        url: `/products/category/${slug}`,
        method: "GET",
        params: { page, limit },
      }),
      transformResponse: (res: { data: UserProductResponse }) => {
        console.log("📦 Category Products Response:", res.data);
        return res.data;
      },
      providesTags: (_result, _error, { slug }) => [
        { type: "UserProducts", id: `category-${slug}` },
      ],
    }),
  }),
});

export const {
  useGetPublishedProductsQuery,
  useGetProductBySlugQuery,
  useGetProductByIDQuery,
  useGetLatestProductsQuery,
  useSearchProductsQuery,
  useGetProductsByCategoryQuery,
} = userProductApi;
