import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { createApi } from "@reduxjs/toolkit/query/react";
import { DisplayProduct, Product, UserProductResponse } from "@/types/Product";
type SimplifiedProduct = {
  _id: string;
  name: string;
  image: string;
  slug: string;
  price: number;
  createdAt: string;
};
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
      transformResponse: (res: { data: UserProductResponse }) => {
        console.log("📦 Backend response:", res); // 👈 Add this
        return res.data;
      },
      providesTags: ["UserProducts"],
    }),

    // ✅ Get single product by slug
    // ✅ Correct
    getProductBySlug: builder.query<DisplayProduct, string>({
      query: (slug) => ({
        url: `/products/getproductbyslug/${slug}`,
        method: "GET",
      }),
      transformResponse: (res: { data: DisplayProduct }) => {
        console.log("raw Product detail Response:", res);
        return res.data; // Assumes API wraps the single product in { data: DisplayProduct }
      },
      providesTags: (_result, _error, slug) => [
        { type: "UserProducts", id: slug },
      ],
    }),

    getProductByID: builder.query<DisplayProduct, string>({
      query: (id) => ({
        url: `/products/getproductbyid/${id}`,
        method: "GET",
      }),
      transformResponse: (res: { data: DisplayProduct }) => res.data,
      providesTags: (_result, _error, id) => [{ type: "UserProducts", id }],
    }),
    getLatestProducts: builder.query<SimplifiedProduct[], void>({
      query: () => ({
        url: "/products/latest-products",
        method: "GET",
      }),
      transformResponse: (response: { data: SimplifiedProduct[] }) => {
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
} = userProductApi;
