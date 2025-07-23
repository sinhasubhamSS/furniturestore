import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Product } from "@/types/Product";

interface CheckoutState {
  selectedAddressId: string | null;
  product: Product | null;
  quantity: number;
  paymentMethod: "COD" | "RAZORPAY" | "";
}

const initialState: CheckoutState = {
  selectedAddressId: null,
  product: null,
  quantity: 1,
  paymentMethod: "",
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setSelectedAddressId(state, action: PayloadAction<string>) {
      state.selectedAddressId = action.payload;
    },
    setProduct(state, action: PayloadAction<Product>) {
      state.product = action.payload;
    },
    setQuantity(state, action: PayloadAction<number>) {
      state.quantity = action.payload;
    },
    setPaymentMethod(state, action: PayloadAction<"COD" | "RAZORPAY">) {
      state.paymentMethod = action.payload;
    },
    resetCheckout(state) {
      Object.assign(state, initialState);
    },
  },
});

export const {
  setSelectedAddressId,
  setProduct,
  setQuantity,
  setPaymentMethod,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
