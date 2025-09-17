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
      async onQueryStarted(arg, { dispatch, queryFulfilled, getState }) {
        console.log("🟡 Optimistic update started with:", arg);

        // Get current cart state for reference
        const currentState = cartApi.endpoints.getCart.select(undefined)(getState());
        const currentCart = currentState.data;

        // Optimistic update
        const patchResult = dispatch(
          cartApi.util.updateQueryData("getCart", undefined, (draft) => {
            if (!draft?.items?.length) return;

            const existingItem = draft.items.find(
              (i) => i.productId === arg.productId && i.variantId === arg.variantId
            );

            if (!existingItem) return;

            // Update the quantity optimistically
            const oldQty = existingItem.quantity;
            const newQty = arg.quantity;
            const diff = newQty - oldQty;

            existingItem.quantity = newQty;

            // Recalculate totals (only if price is available)
            if (existingItem.price !== undefined) {
              draft.totalItems = Math.max(0, draft.totalItems + diff);
              draft.cartSubtotal = Math.max(
                0,
                draft.cartSubtotal + diff * existingItem.price
              );
              draft.cartGST = draft.cartSubtotal * 0.18;
              draft.cartTotal = draft.cartSubtotal + draft.cartGST;
            }
          })
        );

        try {
          const { data: serverData } = await queryFulfilled;
          console.log("✅ API confirmed, updating with server data");
          
          // Invalidate the cart to trigger a refetch
          dispatch(cartApi.util.invalidateTags(["Cart"]));
        } catch (error) {
          console.error("❌ Update failed, rolling back...", error);
          patchResult.undo();
        }
      },
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