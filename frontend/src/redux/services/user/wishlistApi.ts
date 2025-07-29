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
        return response.data;
      },
      providesTags: ["Wishlist"],
    }),

    Wishlistids: builder.query<string[], void>({
      query: () => ({
        url: `/wishlist`,
        method: "GET",
      }),
      transformResponse: (response: any) => {
        console.log(response.data);
        return response.data;
      },
      providesTags: ["Wishlist"],
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
  useWishlistidsQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} = wishlistApi;
