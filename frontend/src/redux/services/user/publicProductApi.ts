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
    // ✅ Enhanced with sortBy support
    getPublishedProducts: builder.query<
      UserProductResponse,
      ProductQueryParams
    >({
      query: ({
        page = 1,
        limit = 10,
        filter = {},
        sortBy = "latest",
      } = {}) => ({
        url: `/products/all`,
        method: "GET",
        params: {
          page,
          limit,
          sortBy, // ✅ Add sortBy parameter
          ...filter, // ✅ Spreads filter object (category, etc.)
        },
      }),
      transformResponse: (res: { data: UserProductResponse }) => {
        console.log("📦 Published Products Response:", res.data);
        console.log("🔄 Sort applied:", res.data); // Debug sort results
        return res.data;
      },
      providesTags: ["UserProducts"],
    }),

    // ✅ Enhanced search with sort support (Future)
    searchProducts: builder.query<
      UserProductResponse,
      { query: string; page?: number; limit?: number; sortBy?: string }
    >({
      query: ({
        query: searchQuery,
        page = 1,
        limit = 10,
        sortBy = "latest",
      }) => ({
        url: "/products/search",
        method: "GET",
        params: { q: searchQuery, page, limit, sortBy },
      }),
      transformResponse: (res: { data: UserProductResponse }) => {
        console.log("📦 Search Results:", res.data);
        return res.data;
      },
    }),

    // ✅ Enhanced category products with sort support (Future)
    getProductsByCategory: builder.query<
      UserProductResponse,
      { slug: string; page?: number; limit?: number; sortBy?: string }
    >({
      query: ({ slug, page = 1, limit = 10, sortBy = "latest" }) => ({
        url: `/products/category/${slug}`,
        method: "GET",
        params: { page, limit, sortBy },
      }),
      transformResponse: (res: { data: UserProductResponse }) => {
        console.log("📦 Category Products Response:", res.data);
        return res.data;
      },
      providesTags: (_result, _error, { slug }) => [
        { type: "UserProducts", id: `category-${slug}` },
      ],
    }),

    // Rest of your methods stay the same...
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
