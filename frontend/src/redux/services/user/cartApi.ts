import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { CartResponse } from "@/types/cart";

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    // ✅ Add item with variant support
    addToCart: builder.mutation<
      CartResponse,
      { productId: string; variantId: string; quantity: number }
    >({
      query: ({ productId, variantId, quantity }) => ({
        url: `/cart/add`,
        method: "POST",
        data: { productId, variantId, quantity }, // ✅ Include variantId
      }),
      invalidatesTags: ["Cart"],
    }),

    // ✅ Get cart
    getCart: builder.query<CartResponse, void>({
      query: () => ({
        url: `/cart/`,
        method: "GET",
      }),
      transformResponse: (response: any) => response.data,
      providesTags: ["Cart"],
    }),

    // ✅ Update quantity with variant support
    updateQuantity: builder.mutation<
      CartResponse,
      { productId: string; variantId: string; quantity: number }
    >({
      query: ({ productId, variantId, quantity }) => ({
        url: `/cart/update`,
        method: "PUT", // ✅ Match backend method
        data: { productId, variantId, quantity }, // ✅ Include variantId
      }),
      invalidatesTags: ["Cart"],
    }),

    // ✅ Remove item with variant support
    removeItem: builder.mutation<
      CartResponse,
      { productId: string; variantId: string }
    >({
      query: ({ productId, variantId }) => ({
        url: `/cart/remove`,
        method: "DELETE",
        data: { productId, variantId }, // ✅ Include variantId
      }),
      invalidatesTags: ["Cart"],
    }),

    // ✅ Clear cart
    clearCart: builder.mutation<CartResponse, void>({
      query: () => ({
        url: `/cart/clear`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    // ✅ Get cart item count
    getCartCount: builder.query<{ count: number }, void>({
      query: () => ({
        url: `/cart/count`,
        method: "GET",
      }),
      transformResponse: (response: any) => response.data,
      providesTags: ["Cart"],
    }),
  }),
});

export const {
  useAddToCartMutation,
  useGetCartQuery,
  useUpdateQuantityMutation,
  useRemoveItemMutation,
  useClearCartMutation,
  useGetCartCountQuery,
} = cartApi;
