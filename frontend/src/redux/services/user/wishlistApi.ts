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

  endpoints: (builder) =>({
    /* ================= LIGHT WISHLIST =================
       SOURCE OF TRUTH FOR HEART ICON
    =================================================== */

    getWishlist: builder.query<WishlistKeyItem[], void>({
      query: () => ({
        url: "/wishlist",
        method: "GET",
      }),

      transformResponse: (res: any) => {
        console.log("[wishlistApi] RAW /wishlist response:", res);

        const items =
          res?.data?.items ??
          res?.data?.data?.items ?? // 🔥 fallback safety
          [];

        console.log("[wishlistApi] FINAL wishlist items:", items);
        return items;
      },

      providesTags: ["Wishlist"],
    }),

    /* ================= HEAVY WISHLIST =================
       ONLY FOR WISHLIST PAGE
    =================================================== */

    getWishlistWithProducts: builder.query<WishlistItemType[], void>({
      query: () => ({
        url: "/wishlist/products",
        method: "GET",
      }),

      transformResponse: (res: any) => {
       

        const data = Array.isArray(res?.data) ? res.data : [];

       

        return data;
      },

      providesTags: ["Wishlist"],
    }),

    /* ================= ADD ================= */

    addToWishlist: builder.mutation<
      void,
      { productId: string; variantId: string }
    >({
      query: (body) => {
        console.log("[wishlistApi] ADD request body:", body);
        return {
          url: "/wishlist/add",
          method: "POST",
          data: body,
        };
      },

      onQueryStarted({ productId, variantId }, { dispatch, queryFulfilled }) {
        console.log("[wishlistApi] ADD optimistic update:", {
          productId,
          variantId,
        });

        const patch = dispatch(
          wishlistApi.util.updateQueryData(
            "getWishlist",
            undefined,
            (draft) => {
              console.log("[wishlistApi] BEFORE ADD cache:");

              const exists = draft.some(
                (i) => i.productId === productId && i.variantId === variantId
              );

              if (!exists) {
                draft.push({ productId, variantId });
                console.log("[wishlistApi] AFTER ADD cache:");
              } else {
                console.log("[wishlistApi] ADD skipped (already exists)");
              }
            }
          )
        );

        queryFulfilled.catch((err) => {
          console.error("[wishlistApi] ADD failed, rollback", err);
          patch.undo();
        });
      },
    }),

    /* ================= REMOVE ================= */

    removeFromWishlist: builder.mutation<
      void,
      { productId: string; variantId: string }
    >({
      query: (body) => {
        console.log("[wishlistApi] REMOVE request body:", body);
        return {
          url: "/wishlist/remove",
          method: "DELETE",
          data: body,
        };
      },

      onQueryStarted({ productId, variantId }, { dispatch, queryFulfilled }) {
       

        const patch = dispatch(
          wishlistApi.util.updateQueryData(
            "getWishlist",
            undefined,
            (draft) => {
              console.log("[wishlistApi] BEFORE REMOVE cache:");

              const index = draft.findIndex(
                (i) => i.productId === productId && i.variantId === variantId
              );

              if (index !== -1) {
                draft.splice(index, 1);
                console.log("[wishlistApi] AFTER REMOVE cache:");
              } else {
                console.log("[wishlistApi] REMOVE skipped (not found)");
              }
            }
          )
        );

        queryFulfilled.catch((err) => {
          console.error("[wishlistApi] REMOVE failed, rollback", err);
          patch.undo();
        });
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
