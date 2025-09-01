// redux/slices/wishlistSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface WishlistState {
  items: string[];
  count: number;
  loadingItems: Record<string, boolean>; // ✅ Per-product loading
  error: string | null;
}

const initialState: WishlistState = {
  items: [],
  count: 0,
  loadingItems: {}, // ✅ Track loading per product ID
  error: null,
};

const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    addToWishlistOptimistic: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      if (!state.items.includes(productId)) {
        state.items.push(productId);
        state.count += 1;
      }
    },

    removeFromWishlistOptimistic: (state, action: PayloadAction<string>) => {
      const productId = action.payload;
      const index = state.items.indexOf(productId);
      if (index !== -1) {
        state.items.splice(index, 1);
        state.count -= 1;
      }
    },

    setWishlistItems: (state, action: PayloadAction<string[]>) => {
      state.items = action.payload;
      state.count = action.payload.length;
    },

    // ✅ Per-product loading actions
    setProductLoading: (
      state,
      action: PayloadAction<{ productId: string; loading: boolean }>
    ) => {
      const { productId, loading } = action.payload;
      if (loading) {
        state.loadingItems[productId] = true;
      } else {
        delete state.loadingItems[productId];
      }
    },

    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    clearWishlist: (state) => {
      state.items = [];
      state.count = 0;
      state.loadingItems = {};
    },
  },
});

export const {
  addToWishlistOptimistic,
  removeFromWishlistOptimistic,
  setWishlistItems,
  setProductLoading, // ✅ New action
  setError,
  clearWishlist,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;
