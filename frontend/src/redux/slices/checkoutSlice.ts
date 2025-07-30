// redux/slices/checkoutSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Address } from "@/types/address";

export interface CartItem {
  productId: string;
  quantity: number;
}

interface CheckoutState {
  selectedAddress: Address | null;
  productId: string | null;
  quantity: number;
  cartItems: CartItem[];
  paymentMethod: "COD" | "RAZORPAY" | "" | null;
}

const initialState: CheckoutState = {
  selectedAddress: null,
  productId: null,
  quantity: 1,
  cartItems: [],
  paymentMethod: null,
};

export const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setSelectedAddress(state, action: PayloadAction<Address>) {
      state.selectedAddress = action.payload;
    },
    setProductId(state, action: PayloadAction<string | null>) {
      state.productId = action.payload;
      if (action.payload) {
        state.cartItems = []; // clear cartItems if single product selected
      }
    },
    setQuantity(state, action: PayloadAction<number>) {
      state.quantity = action.payload;
    },
    setCartItems(state, action: PayloadAction<CartItem[]>) {
      state.cartItems = action.payload;
      if (action.payload.length) {
        state.productId = null; // clear single product selection if cart used
        state.quantity = 1;
      }
    },
    setPaymentMethod(state, action: PayloadAction<"COD" | "RAZORPAY" | null>) {
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
  setCartItems,
  setPaymentMethod,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
