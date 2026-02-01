"use client";

import {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "@/redux/services/user/wishlistApi";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "@/redux/store";
import { skipToken } from "@reduxjs/toolkit/query";

export const useWishlist = () => {
  // ✅ STEP 1: auth state
  const activeUser = useSelector(
    (state: RootState) => state.user.activeUser
  );

  // ✅ STEP 2: skip wishlist API for guest users
  const { data = [], isLoading } = useGetWishlistQuery(
    activeUser ? undefined : skipToken
  );

  const [addToWishlist, addState] = useAddToWishlistMutation();
  const [removeFromWishlist, removeState] = useRemoveFromWishlistMutation();

  /* =====================================================
     NORMALIZED SET
  ===================================================== */
  const wishlistSet = useMemo(() => {
    const set = new Set<string>();
    data.forEach((i) => {
      if (!i?.productId || !i?.variantId) return;
      set.add(`${String(i.productId)}_${String(i.variantId)}`);
    });
    return set;
  }, [data]);

  const isInWishlist = (productId: string, variantId: string) => {
    return wishlistSet.has(`${productId}_${variantId}`);
  };

  const toggleWishlist = async (productId: string, variantId: string) => {
    if (!activeUser) return; // 🔥 HARD GUARD
    if (addState.isLoading || removeState.isLoading) return;

    if (isInWishlist(productId, variantId)) {
      await removeFromWishlist({ productId, variantId }).unwrap();
    } else {
      await addToWishlist({ productId, variantId }).unwrap();
    }
  };

  return {
    isReady: Boolean(activeUser) && !isLoading, // 🔥 IMPORTANT
    isLoading,
    wishlistCount: activeUser ? data.length : 0,
    isInWishlist,
    toggleWishlist,
    isMutating: addState.isLoading || removeState.isLoading,
  };
};
