import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Variant } from "@/types/Product";

interface ProductState {
  selectedVariant: Variant | null;
  selectedImage: string | null;
  selectedColor: string | null;
  selectedSize: string | null;
  quantity: number;
}

const initialState: ProductState = {
  selectedVariant: null,
  selectedImage: null,
  selectedColor: null,
  selectedSize: null,
  quantity: 1,
};

const productDetailSlice = createSlice({
  name: "productDetail",
  initialState,
  reducers: {
    setSelectedVariant: (state, action: PayloadAction<Variant | null>) => {
      state.selectedVariant = action.payload;
    },
    setSelectedImage: (state, action: PayloadAction<string | null>) => {
      state.selectedImage = action.payload;
    },
    setSelectedColor: (state, action: PayloadAction<string | null>) => {
      state.selectedColor = action.payload;
    },
    setSelectedSize: (state, action: PayloadAction<string | null>) => {
      state.selectedSize = action.payload;
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
  setSelectedImage,
  setSelectedColor,
  setSelectedSize,
  setQuantity,
  resetProductState,
} = productDetailSlice.actions;

export default productDetailSlice.reducer;
