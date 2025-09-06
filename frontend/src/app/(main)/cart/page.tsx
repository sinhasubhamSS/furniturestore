"use client";

import { useState } from "react";
import {
  useGetCartQuery,
  useUpdateQuantityMutation,
  useRemoveItemMutation,
} from "@/redux/services/user/cartApi";
import ProductCartItem from "@/components/cart/cartComponent";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { setCartPurchase } from "@/redux/slices/checkoutSlice";
import Button from "@/components/ui/Button";
import { ChevronUp, ChevronDown } from "lucide-react";

const CartPage = () => {
  const [showDetails, setShowDetails] = useState(false);
  const { data, isLoading, error } = useGetCartQuery();
  const [updateQty] = useUpdateQuantityMutation();
  const [removeItem] = useRemoveItemMutation();
  const router = useRouter();
  const dispatch = useDispatch();

  const handleProceedToCheckout = () => {
    if (!data || !data.items || data.items.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    const checkoutItems = data.items.map((item) => ({
      productId: item.product._id,
      variantId: item.variantId,
      quantity: item.quantity,
    }));

    dispatch(setCartPurchase(checkoutItems));
    router.push("/checkout");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[var(--color-primary)] px-4">
        <div className="text-center bg-[var(--color-card)] p-6 md:p-8 rounded-xl md:rounded-2xl shadow-lg w-full max-w-sm">
          <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-4 border-[var(--color-accent)] mx-auto"></div>
          <p className="mt-3 md:mt-4 text-[var(--color-foreground)] font-medium text-sm md:text-base">
            Loading cart...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center px-4">
        <div className="text-center bg-[var(--color-card)] p-6 md:p-8 rounded-xl md:rounded-2xl shadow-lg w-full max-w-sm">
          <div className="text-3xl md:text-4xl mb-3 md:mb-4">⚠️</div>
          <p className="text-[var(--text-error)] font-semibold text-sm md:text-lg mb-4">
            Error loading cart
          </p>
          <Button
            onClick={() => window.location.reload()}
            className="text-sm md:text-base font-medium"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (!data || !data.items || data.items.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center px-4">
        <div className="text-center bg-[var(--color-card)] p-8 md:p-12 rounded-xl md:rounded-2xl shadow-lg w-full max-w-md">
          <div className="text-6xl md:text-8xl mb-4 md:mb-6">🛒</div>
          <h2 className="text-xl md:text-3xl font-bold mb-3 md:mb-4 text-[var(--color-foreground)]">
            Your cart is empty
          </h2>
          <p className="text-[var(--text-accent)] mb-6 md:mb-8 text-sm md:text-lg">
            Add some furniture to get started!
          </p>
          <Button
            onClick={() => router.push("/products")}
            className="w-full py-3 md:py-4 font-semibold text-sm md:text-lg shadow-lg hover:shadow-xl"
          >
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-primary)] pb-32 md:pb-8">
      <div className="w-full max-w-6xl mx-auto px-4">
        {/* Mobile-optimized Header */}
        <div className="py-4 md:py-8">
          <div className="flex items-center justify-between mb-4 md:mb-0">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-[var(--color-foreground)] mb-1">
                My Cart
              </h1>
              <p className="text-[var(--text-accent)] text-sm md:text-base">
                {data.totalItems} {data.totalItems === 1 ? 'item' : 'items'}
              </p>
            </div>

            {/* Desktop Continue Shopping */}
            <Button
              variant="ghost"
              onClick={() => router.push("/products")}
              className="hidden md:flex items-center gap-2 font-semibold"
            >
              <span>←</span>
              <span>Continue Shopping</span>
            </Button>
          </div>

          {/* Mobile Continue Shopping */}
          <Button
            variant="outline"
            onClick={() => router.push("/products")}
            className="md:hidden w-full py-2.5 font-medium text-sm"
          >
            ← Continue Shopping
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-3 md:space-y-4">
            {data.items.map((item) => (
              <ProductCartItem
                key={`${item.product._id}-${item.variantId}`}
                product={item.product}
                variantId={item.variantId}
                quantity={item.quantity}
                onRemove={() =>
                  removeItem({
                    productId: item.product._id,
                    variantId: item.variantId,
                  })
                }
                onQuantityChange={(qty) =>
                  updateQty({
                    productId: item.product._id,
                    variantId: item.variantId,
                    quantity: qty,
                  })
                }
              />
            ))}
          </div>

          {/* Desktop Summary Sidebar */}
          <div className="lg:col-span-1 hidden lg:block">
            <div className="bg-[var(--color-card)] p-6 rounded-2xl shadow-lg border border-[var(--color-border-custom)] sticky top-8">
              <h3 className="text-2xl font-bold mb-6 text-[var(--color-foreground)] border-b-2 border-[var(--color-accent)] pb-2 w-max">
                Order Summary
              </h3>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2">
                  <span className="text-[var(--color-foreground)] font-medium">
                    Subtotal ({data.totalItems} items)
                  </span>
                  <span className="text-[var(--color-foreground)] font-semibold">
                    ₹{data.cartSubtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-[var(--color-foreground)] font-medium">GST</span>
                  <span className="text-[var(--color-foreground)] font-semibold">
                    ₹{data.cartGST.toFixed(2)}
                  </span>
                </div>

                <div className="border-t-2 border-[var(--color-border-custom)] pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-[var(--color-foreground)]">Total</span>
                    <span className="text-2xl font-bold text-[var(--color-accent)]">
                      ₹{data.cartTotal.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleProceedToCheckout}
                disabled={!data.items || data.items.length === 0}
                className="w-full py-4 font-bold text-lg shadow-lg hover:shadow-xl"
              >
                🛒 Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Fixed Bottom Checkout - Enhanced Version */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-[var(--color-card)] border-t border-[var(--color-border-custom)] shadow-2xl z-50">
        {/* Expandable Summary Details */}
        <div className={`transition-all duration-300 overflow-hidden ${showDetails ? 'max-h-48' : 'max-h-0'}`}>
          <div className="p-4 border-b border-[var(--color-border-custom)] bg-[var(--color-secondary)]">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-foreground)]">
                  Subtotal ({data.totalItems} items)
                </span>
                <span className="font-semibold text-[var(--color-foreground)]">
                  ₹{data.cartSubtotal.toFixed(2)}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-[var(--color-foreground)]">GST</span>
                <span className="font-semibold text-[var(--color-foreground)]">
                  ₹{data.cartGST.toFixed(2)}
                </span>
              </div>
              
              <div className="border-t border-[var(--color-border-custom)] pt-2 flex justify-between">
                <span className="font-bold text-[var(--color-foreground)]">Total</span>
                <span className="font-bold text-[var(--color-accent)] text-lg">
                  ₹{data.cartTotal.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Bottom Bar */}
        <div className="p-4">
          {/* Toggle Summary Button */}
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full flex items-center justify-between mb-3 py-2 px-2 hover:bg-[var(--color-secondary)] rounded transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm text-[var(--text-accent)]">
                {data.totalItems} {data.totalItems === 1 ? 'item' : 'items'}
              </span>
              <span className="text-lg font-bold text-[var(--color-accent)]">
                ₹{data.cartTotal.toFixed(0)}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs text-[var(--text-accent)] font-medium">
              <span>{showDetails ? 'Hide' : 'View'} details</span>
              {showDetails ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </div>
          </button>
          
          <Button
            onClick={handleProceedToCheckout}
            disabled={!data.items || data.items.length === 0}
            className="w-full py-3.5 font-bold text-base shadow-lg"
          >
            🛒 Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
