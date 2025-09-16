// src/redux/services/user/cartApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import type { CartResponse } from "@/types/cart";

const recomputeTotalItems = (items: CartResponse["items"]) =>
  items.reduce((s: number, i) => s + Number(i.quantity || 0), 0);

export const cartApi = createApi({
  reducerPath: "cartApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Cart"],
  endpoints: (builder) => ({
    getCart: builder.query<CartResponse, void>({
      query: () => ({ url: "/cart/", method: "GET" }),
      transformResponse: (res: { data: CartResponse }) => res.data,
      providesTags: ["Cart"],
    }),

    addToCart: builder.mutation<
      CartResponse,
      { productId: string; variantId: string; quantity: number }
    >({
      query: (body) => ({ url: "/cart/add", method: "POST", data: body }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          cartApi.util.updateQueryData("getCart", undefined, (draft) => {
            const existing = draft.items.find(
              (i) =>
                i.productId === arg.productId && i.variantId === arg.variantId
            );
            if (existing) {
              existing.quantity =
                Number(existing.quantity || 0) + Number(arg.quantity || 0);
            } else {
              draft.items.push({
                productId: arg.productId,
                variantId: arg.variantId,
                quantity: arg.quantity,
                addedAt: new Date().toISOString(),
              } as any);
            }
            draft.totalItems = recomputeTotalItems(draft.items);
          })
        );
        try {
          const { data } = await queryFulfilled;
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
          patch.undo();
        }
      },
      invalidatesTags: ["Cart"], // ensures getCartCount refetches
    }),

    updateQuantity: builder.mutation<
      CartResponse,
      { productId: string; variantId: string; quantity: number }
    >({
      query: (body) => ({ url: "/cart/update", method: "PUT", data: body }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          cartApi.util.updateQueryData("getCart", undefined, (draft) => {
            const existing = draft.items.find(
              (i) =>
                i.productId === arg.productId && i.variantId === arg.variantId
            );
            if (existing) existing.quantity = Number(arg.quantity || 0);
            draft.totalItems = recomputeTotalItems(draft.items);
          })
        );
        try {
          const { data } = await queryFulfilled;
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
          patch.undo();
        }
      },
      invalidatesTags: ["Cart"],
    }),

    removeItem: builder.mutation<
      CartResponse,
      { productId: string; variantId: string }
    >({
      query: (body) => ({ url: "/cart/remove", method: "DELETE", data: body }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          cartApi.util.updateQueryData("getCart", undefined, (draft) => {
            draft.items = draft.items.filter(
              (i) =>
                !(
                  i.productId === arg.productId && i.variantId === arg.variantId
                )
            );
            draft.totalItems = recomputeTotalItems(draft.items);
          })
        );
        try {
          const { data } = await queryFulfilled;
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
          patch.undo();
        }
      },
      invalidatesTags: ["Cart"],
    }),

    clearCart: builder.mutation<CartResponse, void>({
      query: () => ({ url: "/cart/clear", method: "DELETE" }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          cartApi.util.updateQueryData("getCart", undefined, (draft) => {
            draft.items = [];
            draft.totalItems = 0;
            draft.cartSubtotal = 0;
            draft.cartGST = 0;
            draft.cartTotal = 0;
          })
        );
        try {
          const { data } = await queryFulfilled;
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
          patch.undo();
        }
      },
      invalidatesTags: ["Cart"],
    }),

    getCartCount: builder.query<{ count: number }, void>({
      query: () => ({ url: "/cart/count", method: "GET" }),
       transformResponse: (response: any) => {
        console.log("🔍 RTK Query - get cartresponecount.data:", response.data);
        return response.data;
      },
      providesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateQuantityMutation,
  useRemoveItemMutation,
  useClearCartMutation,
  useGetCartCountQuery,
} = cartApi;
