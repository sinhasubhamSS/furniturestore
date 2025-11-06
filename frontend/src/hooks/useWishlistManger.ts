// hooks/useWishlistManager.ts
"use client";

import { useDispatch, useSelector, shallowEqual } from "react-redux";
import { useMemo, useCallback, useEffect } from "react";
import { RootState } from "@/redux/store";
import {
  addToWishlistOptimistic,
  removeFromWishlistOptimistic,
  setWishlistItems,
  setProductLoading,
  setError,
} from "@/redux/slices/wishlistSlice";
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useWishlistidsQuery,
} from "@/redux/services/user/wishlistApi";

export const useWishlistManager = () => {
  const dispatch = useDispatch();

  // Defaults to safe types to prevent runtime issues on first render
  const {
    items: wishlistIdsFromState = [],
    count = 0,
    loadingItems = {},
    error = null,
  } = useSelector((s: RootState) => s.wishlist, shallowEqual);

  const { data: apiWishlistIds } = useWishlistidsQuery();
  const [addToWishlistAPI] = useAddToWishlistMutation();
  const [removeFromWishlistAPI] = useRemoveFromWishlistMutation();

  useEffect(() => {
    if (apiWishlistIds === undefined || apiWishlistIds === null) return;

    let normalized: string[] = [];

    if (Array.isArray(apiWishlistIds)) {
      normalized = apiWishlistIds.map(String);
    } else if (Array.isArray((apiWishlistIds as any).productIds)) {
      normalized = (apiWishlistIds as any).productIds.map(String);
    } else {
      normalized = [];
    }

    dispatch(setWishlistItems(normalized));
  }, [apiWishlistIds, dispatch]);

  const addToWishlist = useCallback(
    async (productId: string) => {
      const id = String(productId);
      dispatch(addToWishlistOptimistic(id));
      dispatch(setProductLoading({ productId: id, loading: true }));

      try {
        await addToWishlistAPI({ productId: id }).unwrap();
        dispatch(setError(null));
      } catch (err: any) {
        dispatch(removeFromWishlistOptimistic(id));
        dispatch(setError(err?.message || "Failed to add to wishlist"));
        console.error("❌ Add to wishlist failed:", err);
        throw err;
      } finally {
        dispatch(setProductLoading({ productId: id, loading: false }));
      }
    },
    [addToWishlistAPI, dispatch]
  );

  const removeFromWishlist = useCallback(
    async (productId: string) => {
      const id = String(productId);
      dispatch(removeFromWishlistOptimistic(id));
      dispatch(setProductLoading({ productId: id, loading: true }));

      try {
        await removeFromWishlistAPI({ productId: id }).unwrap();
        dispatch(setError(null));
      } catch (err: any) {
        dispatch(addToWishlistOptimistic(id));
        dispatch(setError(err?.message || "Failed to remove from wishlist"));
        console.error("❌ Remove from wishlist failed:", err);
        throw err;
      } finally {
        dispatch(setProductLoading({ productId: id, loading: false }));
      }
    },
    [removeFromWishlistAPI, dispatch]
  );

  const isInWishlist = useCallback(
    (productId: string) => {
      const id = String(productId);
      return (
        Array.isArray(wishlistIdsFromState) && wishlistIdsFromState.includes(id)
      );
    },
    [wishlistIdsFromState]
  );

  const isProductLoading = useCallback(
    (productId: string) => !!loadingItems[String(productId)],
    [loadingItems]
  );

  return useMemo(
    () => ({
      wishlistIds: Array.isArray(wishlistIdsFromState)
        ? wishlistIdsFromState
        : [],
      count,
      error,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      isProductLoading,
    }),
    [
      wishlistIdsFromState,
      count,
      error,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      isProductLoading,
    ]
  );
};
