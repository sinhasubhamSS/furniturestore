// redux/services/user/wishlistApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { CartProduct } from "@/types/cart";

export const wishlistApi = createApi({
  reducerPath: "wishlistApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Wishlist"],
  endpoints: (builder) => ({
    getWishlistWithProducts: builder.query<CartProduct[], void>({
      query: () => ({
        url: "/wishlist/products",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        console.log("📦 Wishlist Products Response:", response);
        return response.data;
      },
      providesTags: ["Wishlist"],
    }),

    isInWishlist: builder.query<{ isWishlisted: boolean }, string>({
      query: (productId) => ({
        url: `/wishlist/check?productId=${productId}`,
        method: "GET",
      }),
      transformResponse: (response: any) => {
        console.log("📦 Wishlist Products Response:", response);
        return response.data;
      },
    }),

    addToWishlist: builder.mutation<void, { productId: string }>({
      query: ({ productId }) => ({
        url: "/wishlist/add",
        method: "POST",
        data: { productId },
      }),
      invalidatesTags: ["Wishlist"],
    }),

    removeFromWishlist: builder.mutation<void, { productId: string }>({
      query: ({ productId }) => ({
        url: "/wishlist/remove",
        method: "DELETE",
        data: { productId },
      }),
      invalidatesTags: ["Wishlist"],
    }),
  }),
});

export const {
  useGetWishlistWithProductsQuery,
  useIsInWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} = wishlistApi;
