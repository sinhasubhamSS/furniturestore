import { Address } from "@/types/address";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CheckoutState {
  selectedAddress: Address | null;
  productId: string | null;
  quantity: number;
  paymentMethod: "COD" | "RAZORPAY" | "";
}

const initialState: CheckoutState = {
  selectedAddress: null,
  productId: null,
  quantity: 1,
  paymentMethod: "",
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setSelectedAddress(state, action: PayloadAction<Address>) {
      state.selectedAddress = action.payload;
    },
    setProductId(state, action: PayloadAction<string>) {
      state.productId = action.payload;
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
  setSelectedAddress,
  setProductId,
  setQuantity,
  setPaymentMethod,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
