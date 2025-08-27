// redux/slices/cartSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { CartItem, CartState } from '@/types/cart';
import { DeliveryInfo } from '@/types/delivery';


const initialState: CartState = {
  items: [],
  totalItems: 0,
  cartSubtotal: 0,
  cartGST: 0,
  cartTotal: 0,
  totalWeight: 0,
  deliveryCharges: 0,
  finalTotal: 0,
  syncing: false,
  deliveryInfo: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // ✅ Sync entire cart from server (no calculations needed)
    syncCartFromServer: (state, action: PayloadAction<any>) => {
      const serverCart = action.payload;
      
      if (serverCart && serverCart.items) {
        // Transform server cart items to local format
        state.items = serverCart.items.map((item: any) => {
          const selectedVariant = item.product.variants?.find(
            (v: any) => v._id === item.variantId
          );

          return {
            productId: item.product._id,
            variantId: item.variantId,
            quantity: item.quantity,
            name: item.product.name,
            image: selectedVariant?.images?.url || '',
            price: selectedVariant?.discountedPrice || selectedVariant?.price || 0,
            hasDiscount: selectedVariant?.hasDiscount || false,
            discountPercent: selectedVariant?.discountPercent || 0,
            color: selectedVariant?.color || '',
            size: selectedVariant?.size || '',
            stock: selectedVariant?.stock || 0,
            weight: item.product.measurements?.weight || 1,
            addedAt: item.addedAt,
          };
        });

        // Use server calculated totals (no duplication)
        state.totalItems = serverCart.totalItems;
        state.cartSubtotal = serverCart.cartSubtotal;
        state.cartGST = serverCart.cartGST;
        state.cartTotal = serverCart.cartTotal;
        
        // Calculate total weight for delivery
        state.totalWeight = state.items.reduce(
          (total, item) => total + (item.weight * item.quantity), 0
        );

        // Update final total with delivery charges
        state.finalTotal = state.cartTotal + state.deliveryCharges;
      }
    },

    // ✅ Optimistic add to cart (instant UI feedback)
    optimisticAddToCart: (state, action: PayloadAction<CartItem>) => {
      const newItem = action.payload;
      const existingItemIndex = state.items.findIndex(
        item => item.productId === newItem.productId && item.variantId === newItem.variantId
      );

      if (existingItemIndex >= 0) {
        // Update existing item
        state.items[existingItemIndex].quantity += newItem.quantity;
      } else {
        // Add new item
        state.items.push(newItem);
      }

      // Recalculate client-side (will be overridden by server sync)
      cartSlice.caseReducers.recalculateClientTotals(state);
    },

    // ✅ Optimistic quantity update
    optimisticUpdateQuantity: (state, action: PayloadAction<{
      productId: string; 
      variantId: string; 
      quantity: number;
    }>) => {
      const { productId, variantId, quantity } = action.payload;
      const item = state.items.find(
        item => item.productId === productId && item.variantId === variantId
      );

      if (item) {
        item.quantity = Math.max(1, Math.min(quantity, item.stock));
        cartSlice.caseReducers.recalculateClientTotals(state);
      }
    },

    // ✅ Optimistic remove item
    optimisticRemoveItem: (state, action: PayloadAction<{
      productId: string; 
      variantId: string;
    }>) => {
      const { productId, variantId } = action.payload;
      state.items = state.items.filter(
        item => !(item.productId === productId && item.variantId === variantId)
      );
      cartSlice.caseReducers.recalculateClientTotals(state);
    },

    // ✅ Update delivery information
    updateDeliveryInfo: (state, action: PayloadAction<DeliveryInfo>) => {
      state.deliveryInfo = action.payload;
      state.deliveryCharges = action.payload.deliveryCharge;
      state.finalTotal = state.cartTotal + state.deliveryCharges;
    },

    // ✅ Clear delivery info
    clearDeliveryInfo: (state) => {
      state.deliveryInfo = null;
      state.deliveryCharges = 0;
      state.finalTotal = state.cartTotal;
    },

    // ✅ Set sync status
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.syncing = action.payload;
    },

    // ✅ Clear entire cart
    clearCart: (state) => {
      state.items = [];
      state.totalItems = 0;
      state.cartSubtotal = 0;
      state.cartGST = 0;
      state.cartTotal = 0;
      state.totalWeight = 0;
      state.finalTotal = state.deliveryCharges;
    },

    // ✅ Helper: Client-side calculations (temporary until server sync)
    recalculateClientTotals: (state) => {
      state.totalItems = state.items.reduce((total, item) => total + item.quantity, 0);
      
      // Simple calculation for immediate feedback
      state.cartSubtotal = state.items.reduce(
        (total, item) => total + (item.price * item.quantity), 0
      );
      
      // Approximate GST calculation
      state.cartGST = state.cartSubtotal * 0.18;
      state.cartTotal = state.cartSubtotal + state.cartGST;
      
      // Calculate total weight
      state.totalWeight = state.items.reduce(
        (total, item) => total + (item.weight * item.quantity), 0
      );
      
      // Update final total
      state.finalTotal = state.cartTotal + state.deliveryCharges;
    },
  },
});

export const {
  syncCartFromServer,
  optimisticAddToCart,
  optimisticUpdateQuantity,
  optimisticRemoveItem,
  updateDeliveryInfo,
  clearDeliveryInfo,
  setSyncing,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;

// ✅ Selectors for easy access
export const selectCartItems = (state: any) => state.cart.items;
export const selectCartTotal = (state: any) => state.cart.cartTotal;
export const selectCartWeight = (state: any) => state.cart.totalWeight;
export const selectDeliveryInfo = (state: any) => state.cart.deliveryInfo;
export const selectFinalTotal = (state: any) => state.cart.finalTotal;
