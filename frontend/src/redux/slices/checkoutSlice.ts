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
  paymentMethod: "COD" | "RAZORPAY" | "ADVANCE" | null;
  verification: VerificationState;
  isRehydrated: boolean;
  
  fees: {
    packagingFee: number;
    deliveryCharge: number;
    codHandlingFee: number;
    advanceAmount: number;
    remainingAmount: number;
    totalAmount: number;
  };
  
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
  // ✅ All fees from backend - no hardcoded values
  fees: {
    packagingFee: 0, // ✅ Backend will set this
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
      state.fees = { ...initialState.fees };
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
      state.fees = { ...initialState.fees };
    },

    // ✅ UNIVERSAL: Works for both direct purchase AND cart items
    updateQuantity(
      state, 
      action: PayloadAction<
        | number // For direct purchase - just pass quantity
        | { productId: string; variantId: string; quantity: number } // For cart items
      >
    ) {
      if (state.type === "direct_purchase" && state.items.length === 1) {
        // ✅ Direct purchase - payload is just a number
        if (typeof action.payload === "number") {
          state.items[0].quantity = Math.max(1, action.payload);
        }
      } else if (state.type === "cart_purchase" && typeof action.payload === "object") {
        // ✅ Cart purchase - payload is an object with productId, variantId, quantity
        const { productId, variantId, quantity } = action.payload;
        const itemIndex = state.items.findIndex(
          item => item.productId === productId && item.variantId === variantId
        );
        
        if (itemIndex !== -1) {
          state.items[itemIndex].quantity = Math.max(1, quantity);
        }
      }
      
      state.verification.status = "pending";
    },

    // ✅ NEW: Specific cart item quantity update (for backward compatibility)
    updateItemQuantity(
      state, 
      action: PayloadAction<{ productId: string; variantId: string; quantity: number }>
    ) {
      const itemIndex = state.items.findIndex(
        item => item.productId === action.payload.productId && 
                item.variantId === action.payload.variantId
      );
      
      if (itemIndex !== -1) {
        state.items[itemIndex].quantity = Math.max(1, action.payload.quantity);
        state.verification.status = "pending";
      }
    },

    // ✅ NEW: Sync entire cart with fresh data from Cart API
    syncCartItems(
      state,
      action: PayloadAction<{
        productId: string;
        variantId: string;
        quantity: number;
      }[]>
    ) {
      if (state.type === "cart_purchase") {
        state.items = action.payload;
        state.verification.status = "pending";
      }
    },

    setSelectedAddress(state, action: PayloadAction<Address>) {
      state.selectedAddress = action.payload;
    },

    setPaymentMethod(state, action: PayloadAction<"COD" | "RAZORPAY" | "ADVANCE" | null>) {
      state.paymentMethod = action.payload;
    },

    // ✅ SECURE: No fallbacks - only update with backend values
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
      // ✅ Only update if backend provides values
      if (action.payload.packagingFee !== undefined) {
        state.fees.packagingFee = action.payload.packagingFee;
      }
      if (action.payload.deliveryCharge !== undefined) {
        state.fees.deliveryCharge = action.payload.deliveryCharge;
      }
      if (action.payload.codHandlingFee !== undefined) {
        state.fees.codHandlingFee = action.payload.codHandlingFee;
      }
      if (action.payload.advanceAmount !== undefined) {
        state.fees.advanceAmount = action.payload.advanceAmount;
      }
      if (action.payload.remainingAmount !== undefined) {
        state.fees.remainingAmount = action.payload.remainingAmount;
      }
      if (action.payload.totalAmount !== undefined) {
        state.fees.totalAmount = action.payload.totalAmount;
      }
    },

    // ✅ SECURE: Backend calculates all advance values
    setAdvanceEligibility(
      state,
      action: PayloadAction<{ 
        eligible: boolean; 
        orderValue: number;
        percentage?: number;
        advanceAmount?: number;
        remainingAmount?: number;
      }>
    ) {
      state.isAdvanceEligible = action.payload.eligible;
      
      if (action.payload.eligible) {
        if (action.payload.advanceAmount !== undefined) {
          state.fees.advanceAmount = action.payload.advanceAmount;
        }
        if (action.payload.remainingAmount !== undefined) {
          state.fees.remainingAmount = action.payload.remainingAmount;
        }
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
  updateQuantity, // ✅ Universal quantity update
  updateItemQuantity, // ✅ Specific cart item update
  syncCartItems, // ✅ NEW: Sync with external cart data
  setSelectedAddress,
  setPaymentMethod,
  updateFees,
  setAdvanceEligibility,
  setVerificationComplete,
  resetCheckout,
  setRehydrated,
} = checkoutSlice.actions;

export default checkoutSlice.reducer;
