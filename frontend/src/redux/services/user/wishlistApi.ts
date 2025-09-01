// redux/services/user/wishlistApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { DisplayProduct } from "@/types/Product";

export const wishlistApi = createApi({
  reducerPath: "wishlistApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Wishlist"],
  endpoints: (builder) => ({
    // ✅ Fixed: Correct return type and URL
    getWishlistWithProducts: builder.query<DisplayProduct[], void>({
      query: () => ({
        url: "/wishlist/products", // ✅ Matches backend route
        method: "GET",
      }),
      transformResponse: (response: any) => {
        console.log("📦 Wishlist API Response:", response.data);
        return response.data; // ✅ Backend returns DisplayProduct[] directly
      },
      providesTags: ["Wishlist"],
    }),

    // ✅ Get wishlist IDs only
    Wishlistids: builder.query<string[], void>({
      query: () => ({
        url: `/wishlist`, // ✅ Matches backend route
        method: "GET",
      }),
      transformResponse: (response: any) => {
        console.log("Wishlist IDs:", response.data);
        return response.data;
      },
      providesTags: ["Wishlist"],
    }),

    addToWishlist: builder.mutation<void, { productId: string }>({
      query: ({ productId }) => ({
        url: "/wishlist/add", // ✅ Matches backend route
        method: "POST",
        data: { productId },
      }),
      invalidatesTags: ["Wishlist"],
    }),

    removeFromWishlist: builder.mutation<void, { productId: string }>({
      query: ({ productId }) => ({
        url: "/wishlist/remove", // ✅ Matches backend route
        method: "DELETE",
        data: { productId },
      }),
      invalidatesTags: ["Wishlist"],
    }),
  }),
});

export const {
  useGetWishlistWithProductsQuery,
  useWishlistidsQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} = wishlistApi;
