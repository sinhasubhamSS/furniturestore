// redux/services/user/wishlistApi.ts
import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "@/redux/api/customBaseQuery";
import { DisplayProduct } from "@/types/Product";

export const wishlistApi = createApi({
  reducerPath: "wishlistApi",
  baseQuery: axiosBaseQuery(),
  tagTypes: ["Wishlist"],
  endpoints: (builder) => ({
    // Full product list (populated) for wishlist
    getWishlistWithProducts: builder.query<DisplayProduct[], void>({
      query: () => ({
        url: "/wishlist/products",
        method: "GET",
      }),
      transformResponse: (response: any) => {
        // backend returns ApiResponse { status, data: DisplayProduct[], message }
        const data = response?.data ?? [];
        if (!Array.isArray(data)) return [];
        return data as DisplayProduct[];
      },
      providesTags: ["Wishlist"],
    }),

    // Get wishlist IDs only (normalize to string[])
    Wishlistids: builder.query<string[], void>({
      query: () => ({
        url: `/wishlist`,
        method: "GET",
      }),
      transformResponse: (response: any) => {
        // Expecting ApiResponse { status, data: { items: [], productIds: [] } }
        const data = response?.data;

        // If already an array returned directly -> map to strings
        if (Array.isArray(data)) {
          return data.map(String);
        }

        // If data.productIds exists and is array -> use it
        if (data && Array.isArray(data.productIds)) {
          return data.productIds.map(String);
        }

        // If data.items is array of objects -> try extract productId field
        if (data && Array.isArray(data.items)) {
          const ids = data.items
            .map((it: any) => it.productId ?? it)
            .filter(Boolean)
            .map(String);
          return ids;
        }

        // Fallback to empty array
        return [];
      },
      providesTags: ["Wishlist"],
    }),

    addToWishlist: builder.mutation<void, { productId: string }>({
      query: ({ productId }) => ({
        url: "/wishlist/add",
        method: "POST",
        data: { productId },
      }),
      invalidatesTags: ["Wishlist"],
    }),

    removeFromWishlist: builder.mutation<void, { productId: string }>({
      query: ({ productId }) => ({
        url: "/wishlist/remove",
        method: "DELETE",
        data: { productId },
      }),
      invalidatesTags: ["Wishlist"],
    }),
  }),
});

export const {
  useGetWishlistWithProductsQuery,
  useWishlistidsQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} = wishlistApi;
