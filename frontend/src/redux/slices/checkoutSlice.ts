// redux/slices/checkoutSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Address } from "@/types/address";

// ✅ Verification state for price checking
interface VerificationState {
  status: 'pending' | 'verified' | 'failed';
  serverAmount: number | null;
  clientAmount: number | null;
  lastVerified: string | null;
}

// ✅ Unified checkout state
interface CheckoutState {
  type: 'direct_purchase' | 'cart_purchase' | null;
  items: {
    productId: string;
    variantId: string;
    quantity: number;
  }[];
  selectedAddress: Address | null;
  paymentMethod: "COD" | "RAZORPAY" | null;
  verification: VerificationState;
}

const initialState: CheckoutState = {
  type: null,
  items: [],
  selectedAddress: null,
  paymentMethod: null,
  verification: {
    status: 'pending',
    serverAmount: null,
    clientAmount: null,
    lastVerified: null,
  },
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    // ✅ Product Detail → Buy Now
    setDirectPurchase(
      state, 
      action: PayloadAction<{
        productId: string;
        variantId: string;
        quantity: number;
      }>
    ) {
      state.type = 'direct_purchase';
      state.items = [action.payload];
      state.verification = {
        status: 'pending',
        serverAmount: null,
        clientAmount: null,
        lastVerified: null,
      };
    },

    // ✅ Cart → Checkout
    setCartPurchase(
      state, 
      action: PayloadAction<{
        productId: string;
        variantId: string;
        quantity: number;
      }[]>
    ) {
      state.type = 'cart_purchase';
      state.items = action.payload;
      state.verification = {
        status: 'pending',
        serverAmount: null,
        clientAmount: null,
        lastVerified: null,
      };
    },

    // ✅ Update quantity (direct purchase only)
    updateQuantity(state, action: PayloadAction<number>) {
      if (state.type === 'direct_purchase' && state.items.length === 1) {
        state.items[0].quantity = Math.max(1, action.payload);
        state.verification.status = 'pending';
        state.verification.serverAmount = null;
      }
    },

    // ✅ Address management
    setSelectedAddress(state, action: PayloadAction<Address>) {
      state.selectedAddress = action.payload;
    },

    // ✅ Payment method management
    setPaymentMethod(state, action: PayloadAction<"COD" | "RAZORPAY" | null>) {
      state.paymentMethod = action.payload;
    },

    // ✅ Verification management
    setVerificationComplete(
      state, 
      action: PayloadAction<{ serverAmount: number; clientAmount: number }>
    ) {
      state.verification = {
        status: 'verified',
        serverAmount: action.payload.serverAmount,
        clientAmount: action.payload.clientAmount,
        lastVerified: new Date().toISOString(),
      };
    },

    // ✅ Reset checkout
    resetCheckout() {
      return initialState;
    },
  },
});

export const {
  setDirectPurchase,
  setCartPurchase,
  updateQuantity,
  setSelectedAddress,
  setPaymentMethod,
  setVerificationComplete,
  resetCheckout,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
