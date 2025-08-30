// redux/slices/checkoutSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Address } from "@/types/address";

interface VerificationState {
  status: "pending" | "verified" | "failed";
  serverAmount: number | null;
  clientAmount: number | null;
  lastVerified: string | null;
}

// ✅ Enhanced checkout state
interface CheckoutState {
  type: "direct_purchase" | "cart_purchase" | null;
  items: {
    productId: string;
    variantId: string;
    quantity: number;
  }[];
  selectedAddress: Address | null;
  paymentMethod: "COD" | "RAZORPAY" | "ADVANCE" | null; // ✅ Added ADVANCE
  verification: VerificationState;
  isRehydrated: boolean;
  
  // ✅ New fee tracking
  fees: {
    packagingFee: number;
    deliveryCharge: number;
    codHandlingFee: number;
    advanceAmount: number;
    remainingAmount: number;
    totalAmount: number;
  };
  
  // ✅ Advance payment eligibility
  isAdvanceEligible: boolean;
}

const initialState: CheckoutState = {
  type: null,
  items: [],
  selectedAddress: null,
  paymentMethod: null,
  verification: {
    status: "pending",
    serverAmount: null,
    clientAmount: null,
    lastVerified: null,
  },
  isRehydrated: false,
  fees: {
    packagingFee: 29,
    deliveryCharge: 0,
    codHandlingFee: 0,
    advanceAmount: 0,
    remainingAmount: 0,
    totalAmount: 0,
  },
  isAdvanceEligible: false,
};

const checkoutSlice = createSlice({
  name: "checkout",
  initialState,
  reducers: {
    setDirectPurchase(
      state,
      action: PayloadAction<{
        productId: string;
        variantId: string;
        quantity: number;
      }>
    ) {
      state.type = "direct_purchase";
      state.items = [action.payload];
      state.verification.status = "pending";
      state.fees = { ...initialState.fees }; // Reset fees
    },

    setCartPurchase(
      state,
      action: PayloadAction<
        {
          productId: string;
          variantId: string;
          quantity: number;
        }[]
      >
    ) {
      state.type = "cart_purchase";
      state.items = action.payload;
      state.verification.status = "pending";
      state.fees = { ...initialState.fees }; // Reset fees
    },

    updateQuantity(state, action: PayloadAction<number>) {
      if (state.type === "direct_purchase" && state.items.length === 1) {
        state.items[0].quantity = Math.max(1, action.payload);
        state.verification.status = "pending";
      }
    },

    setSelectedAddress(state, action: PayloadAction<Address>) {
      state.selectedAddress = action.payload;
    },

    // ✅ Enhanced payment method with ADVANCE
    setPaymentMethod(state, action: PayloadAction<"COD" | "RAZORPAY" | "ADVANCE" | null>) {
      state.paymentMethod = action.payload;
    },

    // ✅ New action to update fees
    updateFees(
      state,
      action: PayloadAction<{
        packagingFee?: number;
        deliveryCharge?: number;
        codHandlingFee?: number;
        advanceAmount?: number;
        remainingAmount?: number;
        totalAmount?: number;
      }>
    ) {
      state.fees = { ...state.fees, ...action.payload };
    },

    // ✅ Set advance eligibility
    setAdvanceEligibility(
      state,
      action: PayloadAction<{ eligible: boolean; orderValue: number }>
    ) {
      state.isAdvanceEligible = action.payload.eligible;
      if (action.payload.eligible) {
        state.fees.advanceAmount = Math.round(action.payload.orderValue * 0.1);
        state.fees.remainingAmount = action.payload.orderValue - state.fees.advanceAmount;
      }
    },

    setVerificationComplete(
      state,
      action: PayloadAction<{ serverAmount: number; clientAmount: number }>
    ) {
      state.verification = {
        status: "verified",
        serverAmount: action.payload.serverAmount,
        clientAmount: action.payload.clientAmount,
        lastVerified: new Date().toISOString(),
      };
    },

    resetCheckout() {
      return { ...initialState, isRehydrated: true };
    },

    setRehydrated(state) {
      state.isRehydrated = true;
    },
  },
});

export const {
  setDirectPurchase,
  setCartPurchase,
  updateQuantity,
  setSelectedAddress,
  setPaymentMethod,
  updateFees,
  setAdvanceEligibility,
  setVerificationComplete,
  resetCheckout,
  setRehydrated,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
