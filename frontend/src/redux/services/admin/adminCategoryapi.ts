import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "../../api/customBaseQuery";
import { Category } from "@/types/category";

export const adminCategoryApi = createApi({
  reducerPath: "adminCategoryApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Categories"],
  endpoints: (builder) => ({
    // ✅ Get all categories
    getCategories: builder.query<Category[], void>({
      query: () => ({
        url: "/category/", // Backend API route
        method: "GET",
      }),
      transformResponse: (response: { data: Category[] }) => response.data,
      providesTags: ["Categories"],
    }),

    // ✅ Create new category (with image and name)
    createCategory: builder.mutation<
      Category,
      { name: string; image: { url: string; public_id: string } }
    >({
      query: (body) => ({
        url: "/category/create",
        method: "POST",
        data: body,
      }),
      invalidatesTags: ["Categories"],
    }),
  }),
});

export const { useGetCategoriesQuery, useCreateCategoryMutation } =
  adminCategoryApi;
