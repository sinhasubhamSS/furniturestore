import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { CartItem, CartResponse } from "@/types/cart";

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    addToCart: builder.mutation<
      CartResponse,
      { productId: string; variantId: string; quantity: number }
    >({
      query: ({ productId, variantId, quantity }) => ({
        url: `/cart/add`,
        method: "POST",
        data: { productId, variantId, quantity },
      }),

      invalidatesTags: ["Cart"],
    }),

    getCart: builder.query<CartResponse, void>({
      query: () => ({
        url: `/cart/`,
        method: "GET",
      }),
      transformResponse: (response: any) => response.data,
      providesTags: ["Cart"],
    }),

    updateQuantity: builder.mutation<
      CartResponse,
      { productId: string; variantId: string; quantity: number }
    >({
      query: ({ productId, variantId, quantity }) => ({
        url: `/cart/update`,
        method: "PUT",
        data: { productId, variantId, quantity },
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        // Optimistically update cart cache
        const patchResult = dispatch(
          cartApi.util.updateQueryData("getCart", undefined, (draft) => {
            const existing = draft.items.find(
              (i) =>
                i.productId === arg.productId && i.variantId === arg.variantId
            );

            if (existing) {
              existing.quantity = arg.quantity;
            }
          })
        );

        try {
          const { data } = await queryFulfilled;
          // Sync backend response with local cache
          dispatch(
            cartApi.util.updateQueryData("getCart", undefined, (draft) => {
              draft.items = data.items;
              draft.totalItems = data.totalItems;
              draft.cartSubtotal = data.cartSubtotal;
              draft.cartGST = data.cartGST;
              draft.cartTotal = data.cartTotal;
            })
          );
        } catch {
          // Rollback in case of error
          patchResult.undo();
        }
      },
      invalidatesTags: ["Cart"],
    }),

    removeItem: builder.mutation<
      CartResponse,
      { productId: string; variantId: string }
    >({
      query: ({ productId, variantId }) => ({
        url: `/cart/remove`,
        method: "DELETE",
        data: { productId, variantId },
      }),
      invalidatesTags: ["Cart"],
    }),

    clearCart: builder.mutation<CartResponse, void>({
      query: () => ({
        url: `/cart/clear`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

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
