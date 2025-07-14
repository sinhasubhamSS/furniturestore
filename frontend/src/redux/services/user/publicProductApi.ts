import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { UserProductResponse } from "@/types/Product";
export const userProductApi = createApi({
  reducerPath: "userProductApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["UserProducts"],
  endpoints: (builder) => ({
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
  }),
});

export const { useGetPublishedProductsQuery } = userProductApi;
