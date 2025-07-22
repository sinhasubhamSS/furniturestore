import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/Product";
// Global Redux Checkout Slice (example):
interface CheckoutState {
  selectedAddressId: string | null;
  paymentMethod: string;
  product: Product | null; // Optionally store product too if already fetched
  quantity: number;
  orderSummary: {
    totalItems: number;
    totalPrice: number;
  };
}
const initialState: CheckoutState = {
  selectedAddressId: null,
  paymentMethod: "",
  product: null,
  quantity: 1,
  orderSummary: {
    totalItems: 0,
    totalPrice: 0,
  },
};
const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setSelectedAddressId(state, action: PayloadAction<string>) {
      state.selectedAddressId = action.payload;
    },
    setPaymentMethod(state, action: PayloadAction<string>) {
      state.paymentMethod = action.payload;
    },
    setProduct(state, action: PayloadAction<Product>) {
      state.product = action.payload;
    },
    setQuantity(state, action: PayloadAction<number>) {
      state.quantity = action.payload;
    },
    setOrderSummary(
      state,
      action: PayloadAction<{ totalItems: number; totalPrice: number }>
    ) {
      state.orderSummary = action.payload;
    },
    resetCheckout(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setSelectedAddressId,
  setPaymentMethod,
  setProduct,
  setQuantity,
  setOrderSummary,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
