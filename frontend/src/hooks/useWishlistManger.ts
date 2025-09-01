// hooks/useWishlistManager.ts
'use client';

import { useDispatch, useSelector } from "react-redux";
import { useMemo, useCallback } from "react";
import { RootState } from "@/redux/store";
import { shallowEqual } from "react-redux";
import {
  addToWishlistOptimistic,
  removeFromWishlistOptimistic,
  setWishlistItems,
  setProductLoading, // ✅ Import new action
  setError,
} from "@/redux/slices/wishlistSlice";
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useWishlistidsQuery,
} from "@/redux/services/user/wishlistApi";
import { useEffect } from "react";

export const useWishlistManager = () => {
  const dispatch = useDispatch();

  // ✅ Select wishlist data with shallowEqual
  const { items: wishlistIds, count, loadingItems, error } = useSelector(
    (state: RootState) => state.wishlist,
    shallowEqual
  );

  const [addToWishlistAPI] = useAddToWishlistMutation();
  const [removeFromWishlistAPI] = useRemoveFromWishlistMutation();
  const { data: apiWishlistIds } = useWishlistidsQuery();

  useEffect(() => {
    if (apiWishlistIds) {
      dispatch(setWishlistItems(apiWishlistIds));
    }
  }, [apiWishlistIds, dispatch]);

  // ✅ Updated with per-product loading
  const addToWishlist = useCallback(async (productId: string) => {
    dispatch(addToWishlistOptimistic(productId));
    dispatch(setProductLoading({ productId, loading: true })); // ✅ Per-product loading

    try {
      await addToWishlistAPI({ productId }).unwrap();
      dispatch(setError(null));
    } catch (error: any) {
      dispatch(removeFromWishlistOptimistic(productId));
      dispatch(setError(error.message || "Failed to add to wishlist"));
      console.error("❌ Add to wishlist failed:", error);
    } finally {
      dispatch(setProductLoading({ productId, loading: false })); // ✅ Clear per-product loading
    }
  }, [addToWishlistAPI, dispatch]);

  const removeFromWishlist = useCallback(async (productId: string) => {
    dispatch(removeFromWishlistOptimistic(productId));
    dispatch(setProductLoading({ productId, loading: true })); // ✅ Per-product loading

    try {
      await removeFromWishlistAPI({ productId }).unwrap();
      dispatch(setError(null));
    } catch (error: any) {
      dispatch(addToWishlistOptimistic(productId));
      dispatch(setError(error.message || "Failed to remove from wishlist"));
      console.error("❌ Remove from wishlist failed:", error);
    } finally {
      dispatch(setProductLoading({ productId, loading: false })); // ✅ Clear per-product loading
    }
  }, [removeFromWishlistAPI, dispatch]);

  const isInWishlist = useCallback(
    (productId: string) => wishlistIds.includes(productId),
    [wishlistIds]
  );

  // ✅ New function to check per-product loading
  const isProductLoading = useCallback(
    (productId: string) => !!loadingItems[productId],
    [loadingItems]
  );

  return useMemo(
    () => ({
      wishlistIds,
      count,
      error,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      isProductLoading, // ✅ Return per-product loading function
    }),
    [wishlistIds, count, error, addToWishlist, removeFromWishlist, isInWishlist, isProductLoading]
  );
};
