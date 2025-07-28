import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { CartResponse } from "@/types/cart"; // correct usage

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    // ✅ Add item to cart
    addToCart: builder.mutation<
      CartResponse,
      { productId: string; quantity: number }
    >({
      query: ({ productId, quantity }) => ({
        url: `/cart/add`,
        method: "POST",
        data: { productId, quantity },
      }),
      invalidatesTags: ["Cart"],
    }),

    // ✅ Get cart
    getCart: builder.query<CartResponse, void>({
      query: () => ({
        url: `/cart/`,
        method: "GET",
      }),
      transformResponse: (response: any) => response.data, // ✅ Only extract `.data`
      providesTags: ["Cart"],
    }),

    // ✅ Update quantity
    updateQuantity: builder.mutation<
      CartResponse,
      { productId: string; quantity: number }
    >({
      query: ({ productId, quantity }) => ({
        url: `/cart/update`,
        method: "PATCH",
        data: { productId, quantity },
      }),
      invalidatesTags: ["Cart"],
    }),

    // ✅ Remove item
    removeItem: builder.mutation<CartResponse, { productId: string }>({
      query: ({ productId }) => ({
        url: `/cart/remove`,
        method: "DELETE",
        data: { productId },
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
    getCartCount: builder.query<number, void>({
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
