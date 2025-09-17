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
        body: { productId, variantId, quantity }, // 👈 axios jaisa "data" nahi, RTK Query me "body"
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        console.log("🟡 Optimistic update started with:", arg);

        const patchResult = dispatch(
          cartApi.util.updateQueryData("getCart", undefined, (draft) => {
            const existing = draft.items.find(
              (i) =>
                i.productId === arg.productId && i.variantId === arg.variantId
            );

            if (existing && existing.price !== undefined) {
              const oldQty = existing.quantity;
              const newQty = arg.quantity;
              const diff = newQty - oldQty;

              existing.quantity = newQty;

              draft.totalItems += diff;
              draft.cartSubtotal += diff * existing.price;
              draft.cartGST = draft.cartSubtotal * 0.18;
              draft.cartTotal = draft.cartSubtotal + draft.cartGST;

              console.log("🟢 Optimistic draft update:", {
                oldQty,
                newQty,
                subtotal: draft.cartSubtotal,
                gst: draft.cartGST,
                total: draft.cartTotal,
              });
            }
          })
        );

        try {
          await queryFulfilled;
          console.log("✅ API confirmed, keeping optimistic changes");
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
