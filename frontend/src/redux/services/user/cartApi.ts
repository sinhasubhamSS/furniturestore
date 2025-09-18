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
      async onQueryStarted(arg, { dispatch, getState, queryFulfilled }) {
        console.log("🟡 Optimistic update started:", arg);

        let optimisticTotals = {
          totalItems: 0,
          cartSubtotal: 0,
          cartGST: 0,
          cartTotal: 0,
        };

        const patchResult = dispatch(
          cartApi.util.updateQueryData("getCart", undefined, (draft) => {
            if (!draft.items || draft.items.length === 0) {
              console.log("No items found for optimistic patch");
              return;
            }

            const existingItem = draft.items.find(
              (item) =>
                item.product?._id === arg.productId &&
                item.variantId === arg.variantId
            );
            if (!existingItem) {
              console.warn("No matching item found in cache");
              return;
            }

            existingItem.quantity = arg.quantity;

            let subtotal = 0;
            let gstAmount = 0;

            draft.items.forEach((item) => {
              const variant =
                item.variant ??
                item.product?.variants?.find((v) => v._id === item.variantId);
              if (!variant) return;

              const price = variant.price ?? variant.basePrice ?? 0;
              const basePrice = variant.basePrice ?? 0;
              const quantity = item.quantity;

              let itemBasePrice = 0,
                itemGSTAmount = 0,
                itemFinalPrice = 0;

              if (
                variant.hasDiscount &&
                variant.discountedPrice !== undefined
              ) {
                itemFinalPrice = variant.discountedPrice * quantity;
                itemBasePrice = basePrice * quantity;
                itemGSTAmount = itemFinalPrice - itemBasePrice;
              } else {
                itemFinalPrice = price * quantity;
                itemBasePrice = basePrice * quantity;
                itemGSTAmount = itemFinalPrice - itemBasePrice;
              }

              subtotal += itemBasePrice;
              gstAmount += itemGSTAmount;
            });

            const itemsArray = draft.items as unknown as CartItem[];
            draft.totalItems = itemsArray.reduce(
              (acc, item) => acc + item.quantity,
              0
            );

            draft.cartSubtotal = subtotal;
            draft.cartGST = gstAmount;
            draft.cartTotal = subtotal + gstAmount;

            optimisticTotals = {
              totalItems: draft.totalItems,
              cartSubtotal: draft.cartSubtotal,
              cartGST: draft.cartGST,
              cartTotal: draft.cartTotal,
            };

          
          })
        );

        if (debounceTimers.has(arg.productId + "-" + arg.variantId)) {
          clearTimeout(debounceTimers.get(arg.productId + "-" + arg.variantId));
        }

        try {
          const serverResponse = await queryFulfilled;

          // Agar andar "data" field hai to use karo, warna direct use karo
          const serverData =
            (serverResponse.data as any).data ?? serverResponse.data;
          

         
          const totalsMatch =
            serverData.totalItems === optimisticTotals.totalItems &&
            numbersCloseEnough(
              serverData.cartSubtotal,
              optimisticTotals.cartSubtotal
            ) &&
            numbersCloseEnough(serverData.cartGST, optimisticTotals.cartGST) &&
            numbersCloseEnough(
              serverData.cartTotal,
              optimisticTotals.cartTotal
            );

          if (!totalsMatch) {
            console.warn("❌ Totals mismatch! Rolling back optimistic update.");
            patchResult.undo();
            throw new Error("Optimistic totals mismatch rollback");
          }

          dispatch(cartApi.util.invalidateTags(["Cart"]));
        } catch (error) {
          console.error("API update error, rolling back", error);
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
