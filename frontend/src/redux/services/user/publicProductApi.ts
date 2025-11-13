// src/redux/services/userProductApi.ts

import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import {
  DisplayProduct,
  UserProductResponse,
  ProductQueryParams,
  homeProduct,
} from "@/types/Product";

const DEFAULT_LIST_FIELDS = [
  "_id",
  "slug",
  "name",
  "title",
  "thumbnail", // thumbnail or small image url
  "category",
  "variants", // we will trim variants server-side to only first in listing
];

// optional: maximum number of fields to allow in request params (frontend safety)
const MAX_FIELDS = 20;

export const userProductApi = createApi({
  reducerPath: "userProductApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["UserProducts"],
  endpoints: (builder) => ({
    // ✅ Enhanced with fields + sortBy support
    getPublishedProducts: builder.query<
      UserProductResponse,
      ProductQueryParams
    >({
      keepUnusedDataFor: 32,
      query: ({
        page = 1,
        limit = 10,
        filter = {},
        sortBy = "latest",
        fields, // optional: string[] or comma string
      } = {}) => {
        // if caller provided fields array/string, use it, else use default minimal list
        let fieldsParam: string | undefined;
        if (fields) {
          // normalize array or comma string
          const arr =
            typeof fields === "string"
              ? fields
                  .split(",")
                  .map((f) => f.trim())
                  .filter(Boolean)
              : Array.isArray(fields)
              ? fields
              : [];

          // enforce max count
          const safe = arr.slice(0, MAX_FIELDS);
          if (safe.length) fieldsParam = safe.join(",");
        }

        // fallback to default minimal fields if none specified
        if (!fieldsParam) {
          fieldsParam = DEFAULT_LIST_FIELDS.join(",");
        }

        return {
          url: `/products/all`,
          method: "GET",
          params: {
            page,
            limit,
            sortBy,
            fields: fieldsParam,
            ...filter,
          },
        };
      },
      transformResponse: (res: { data: UserProductResponse }) => {
        return res.data;
      },
      providesTags: ["UserProducts"],
    }),

    // searchProducts — also support fields (optional)
    searchProducts: builder.query<
      UserProductResponse,
      {
        query?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        fields?: string[] | string;
      }
    >({
      query: ({
        query: searchQuery = "",
        page = 1,
        limit = 10,
        sortBy = "latest",
        fields,
      } = {}) => {
        let fieldsParam: string | undefined;
        if (fields) {
          const arr =
            typeof fields === "string"
              ? fields.split(",").map((f) => f.trim())
              : fields;
          fieldsParam = (arr || []).slice(0, MAX_FIELDS).join(",");
        } else {
          fieldsParam = DEFAULT_LIST_FIELDS.join(",");
        }

        return {
          url: "/products/search",
          method: "GET",
          params: { q: searchQuery, page, limit, sortBy, fields: fieldsParam },
        };
      },
      transformResponse: (res: { data: UserProductResponse }) => {
        return res.data;
      },
    }),

    // getProductsByCategory — support fields
    getProductsByCategory: builder.query<
      UserProductResponse,
      {
        slug?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        fields?: string[] | string;
      }
    >({
      query: ({
        slug,
        page = 1,
        limit = 10,
        sortBy = "latest",
        fields,
      } = {}) => {
        let fieldsParam: string | undefined;
        if (fields) {
          const arr =
            typeof fields === "string"
              ? fields.split(",").map((f) => f.trim())
              : fields;
          fieldsParam = (arr || []).slice(0, MAX_FIELDS).join(",");
        } else {
          fieldsParam = DEFAULT_LIST_FIELDS.join(",");
        }

        return {
          url: `/products/category/${slug}`,
          method: "GET",
          params: { page, limit, sortBy, fields: fieldsParam },
        };
      },
      transformResponse: (res: { data: UserProductResponse }) => {
        return res.data;
      },
      providesTags: (_result, _error, { slug }) => [
        { type: "UserProducts", id: `category-${slug}` },
      ],
    }),

    // get single product (detail) — here we generally want full data, so don't send fields by default
    getProductBySlug: builder.query<DisplayProduct, string>({
      query: (slug) => ({
        url: `/products/slug/${slug}`,
        method: "GET",
      }),
      transformResponse: (res: { data: DisplayProduct }) => {
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
        return res.data;
      },
      providesTags: (_result, _error, id) => [{ type: "UserProducts", id }],
    }),

    getLatestProducts: builder.query<homeProduct[], number | void>({
      query: (limit = 8) => ({
        url: "/products/latest",
        method: "GET",
        params: { limit },
      }),
      transformResponse: (response: { data: homeProduct[] }) => {
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
