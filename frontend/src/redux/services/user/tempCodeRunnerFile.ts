import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { WishlistItemType } from "@/types/Product";

/* =====================================================
   TYPES
===================================================== */

export type WishlistKeyItem = {
  productId: string;
  variantId: string;
};

/* =====================================================
   API
===================================================== */

export const wishlistApi = createApi({
  reducerPath: "wishlistApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Wishlist"],
  endpoints: (builder) => ({
    /* ========== LIGHT WISHLIST (SOURCE OF TRUTH) ========== */

    getWishlist: builder.query<WishlistKeyItem[], void>({
      query: () => ({
        url: "/wishlist",
        method: "GET",
      }),
      transformResponse: (res: any) =>
        Array.isArray(res?.data?.items) ? res.data.items : [],
      providesTags: ["Wishlist"],
    }),

    /* ========== HEAVY WISHLIST (PAGE ONLY) ========== */

    getWishlistWithProducts: builder.query<WishlistItemType[], void>({
      query: () => ({
        url: "/wishlist/products",
        method: "GET",
      }),
      transformResponse: (res: any) =>
        Array.isArray(res?.data) ? res.data : [],
      providesTags: ["Wishlist"],
    }),

    /* ========== ADD ========== */

    addToWishlist: builder.mutation<
      void,
      { productId: string; variantId: string }
    >({
      query: (body) => ({
        url: "/wishlist/add",
        method: "POST",
        data: body,
      }),

      onQueryStarted(
  { productId, variantId },
  { dispatch, queryFulfilled }
) {
  const patch = dispatch(
    wishlistApi.util.updateQueryData(
      "getWishlist",
      undefined,
      (draft) => {
        const exists = draft.some(
          (i) =>
            i.productId === productId &&
            i.variantId === variantId
        );
        if (!exists) {
          draft.push({ productId, variantId });
        }
      }
    )
  );

  queryFulfilled.catch(patch.undo);


      },
    }),

    /* ========== REMOVE ========== */

    removeFromWishlist: builder.mutation<
      void,
      { productId: string; variantId: string }
    >({
      query: (body) => ({
        url: "/wishlist/remove",
        method: "DELETE",
        data: body,
      }),

      async onQueryStarted(
        { productId, variantId },
        { dispatch, queryFulfilled }
      ) {
        const patch = dispatch(
          wishlistApi.util.updateQueryData(
            "getWishlist",
            undefined,
            (draft) =>
              draft.filter(
                (i) =>
                  !(
                    i.productId === productId &&
                    i.variantId === variantId
                  )
              )
          )
        );

        try {
          await queryFulfilled;
        } catch {
          patch.undo();
        }
      },
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useGetWishlistWithProductsQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} = wishlistApi;
