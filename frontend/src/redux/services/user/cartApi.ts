import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { CartResponse, CartItem } from "@/types/cart";
function numbersCloseEnough(
  a: number | string,
  b: number | string,
  epsilon = 0.01
): boolean {
  const numA = Number(a);
  const numB = Number(b);
  if (isNaN(numA) || isNaN(numB)) return false;
  return Math.abs(numA - numB) < epsilon;
}

const debounceTimers = new Map<string, ReturnType<typeof setTimeout>>();
interface ApiWrapper<T> {
  success: boolean;
  statusCode: number;
  data: T;
  message: string;
}
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
      query: () => ({ url: `/cart/`, method: "GET" }),
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
        let optimisticTotals = {
          totalItems: 0,
          cartListingTotal: 0,
          totalDiscount: 0,
          cartTotal: 0,
        };

        const patchResult = dispatch(
          cartApi.util.updateQueryData("getCart", undefined, (draft) => {
            if (!draft.items || draft.items.length === 0) return;

            const existingItem = draft.items.find(
              (item) =>
                item.productId === arg.productId &&
                item.variantId === arg.variantId
            );

            if (!existingItem) return;

            // ✅ update quantity
            existingItem.quantity = arg.quantity;

            let listingTotal = 0;
            let discountTotal = 0;

            draft.items.forEach((item) => {
              const qty = item.quantity;

              const listing = (item.listingPrice ?? 0) * qty;
              const selling = (item.sellingPrice ?? 0) * qty;

              listingTotal += listing;
              discountTotal += Math.max(0, listing - selling);
            });

            let totalItems = 0;

            for (const item of draft.items) {
              totalItems += item.quantity;
            }

            draft.totalItems = totalItems;

            draft.cartListingTotal = Math.round(listingTotal);
            draft.totalDiscount = Math.round(discountTotal);
            draft.cartTotal = Math.round(listingTotal - discountTotal);

            optimisticTotals = {
              totalItems: draft.totalItems,
              cartListingTotal: draft.cartListingTotal,
              totalDiscount: draft.totalDiscount,
              cartTotal: draft.cartTotal,
            };
          })
        );

        try {
          const serverResponse = await queryFulfilled;
          const serverData =
            (serverResponse.data as any)?.data ?? serverResponse.data;

          const totalsMatch =
            serverData.totalItems === optimisticTotals.totalItems &&
            numbersCloseEnough(
              serverData.cartListingTotal,
              optimisticTotals.cartListingTotal
            ) &&
            numbersCloseEnough(
              serverData.totalDiscount,
              optimisticTotals.totalDiscount
            ) &&
            numbersCloseEnough(
              serverData.cartTotal,
              optimisticTotals.cartTotal
            );

          if (!totalsMatch) {
            patchResult.undo();
            throw new Error("Optimistic totals mismatch");
          }

          dispatch(cartApi.util.invalidateTags(["Cart"]));
        } catch (err) {
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
      query: () => ({ url: `/cart/clear`, method: "DELETE" }),
      invalidatesTags: ["Cart"],
    }),

    getCartCount: builder.query<{ count: number }, void>({
      query: () => ({ url: `/cart/count`, method: "GET" }),
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
