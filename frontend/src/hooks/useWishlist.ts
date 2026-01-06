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

  /* =====================================================
     DEBUG: RAW DATA FROM API
  ===================================================== */

  // console.log("[useWishlist] raw wishlist data:", data);
  // console.log("[useWishlist] isLoading:", isLoading);

  /* =====================================================
     NORMALIZED SET (SOURCE OF TRUTH)
     🔥 industry standard: always normalize ids to string
  ===================================================== */

  const wishlistSet = useMemo(() => {
    const set = new Set<string>();

    data.forEach((i) => {
      if (!i?.productId || !i?.variantId) return;

      const key = `${String(i.productId)}_${String(i.variantId)}`;
      set.add(key);
    });

    // console.log("[useWishlist] wishlistSet keys:", Array.from(set));

    return set;
  }, [data]);

  /* =====================================================
     CHECK
  ===================================================== */

  const isInWishlist = (productId: string, variantId: string) => {
    const key = `${String(productId)}_${String(variantId)}`;
    const result = wishlistSet.has(key);

    console.log(" isInWishlist check:", {
      productId,
      variantId,
      key,
      result,
    });

    return result;
  };

  /* =====================================================
     TOGGLE
  ===================================================== */

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
    isReady: !isLoading, // 🔥 correct & required
    isLoading,
    wishlistCount: data.length,
    isInWishlist,
    toggleWishlist,
    isMutating: addState.isLoading || removeState.isLoading,

    // DEBUG helpers (optional – future)
    // __rawWishlist: data,
    // __wishlistSet: wishlistSet,
  };
};
