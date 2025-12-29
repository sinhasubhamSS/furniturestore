import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Variant } from "@/types/Product";

interface ProductState {
  selectedVariant: Variant | null;
  quantity: number;
}

const initialState: ProductState = {
  selectedVariant: null,
  quantity: 1,
};

const productDetailSlice = createSlice({
  name: "productDetail",
  initialState,
  reducers: {
    setSelectedVariant: (state, action: PayloadAction<Variant | null>) => {
      state.selectedVariant = action.payload;
    },
    setQuantity: (state, action: PayloadAction<number>) => {
      // Quantity must be at least 1
      state.quantity = Math.max(1, action.payload);
    },
    resetProductState: () => initialState,
  },
});

export const {
  setSelectedVariant,
  setQuantity,
  resetProductState,
} = productDetailSlice.actions;

export default productDetailSlice.reducer;
