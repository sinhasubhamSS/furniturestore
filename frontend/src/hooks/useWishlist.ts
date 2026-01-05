"use client";

import {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "@/redux/services/user/wishlistApi";
import { useMemo } from "react";

export const useWishlist = () => {
  const { data = [], isLoading } = useGetWishlistQuery();

  const [addToWishlist, addState] = useAddToWishlistMutation();
  const [removeFromWishlist, removeState] = useRemoveFromWishlistMutation();

  const wishlistSet = useMemo(
    () => new Set(data.map((i) => `${i.productId}_${i.variantId}`)),
    [data]
  );

  const isInWishlist = (productId: string, variantId: string) =>
    wishlistSet.has(`${productId}_${variantId}`);

  const toggleWishlist = async (productId: string, variantId: string) => {
    if (!productId || !variantId) return;
    if (addState.isLoading || removeState.isLoading) return;

    if (isInWishlist(productId, variantId)) {
      await removeFromWishlist({ productId, variantId }).unwrap();
    } else {
      await addToWishlist({ productId, variantId }).unwrap();
    }
  };

  return {
    isLoading,
    wishlistCount: data.length,
    isInWishlist,
    toggleWishlist,
    isMutating: addState.isLoading || removeState.isLoading,
  };
};
