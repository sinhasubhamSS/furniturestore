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

  const { data, isLoading } = useGetCartQuery();
  const [updateQty] = useUpdateQuantityMutation();
  const [removeItem] = useRemoveItemMutation();

  const router = useRouter();
  const dispatch = useDispatch();

  /* ---------------- loading / empty ---------------- */

  if (isLoading) {
    return <div className="p-10 text-center">Loading…</div>;
  }

  if (!data || !data.items || data.items.length === 0) {
    return <div className="p-10 text-center">Cart is empty</div>;
  }

  /* ---------------- checkout ---------------- */

  const handleCheckout = () => {
    console.log("🛒 CART API DATA:", data);
    const checkoutItems = data.items.map((item: any) => ({
      productId: item.productId, // ✅ ALWAYS EXISTS
      variantId: item.variantId,
      quantity: item.quantity,
    }));
    console.log("➡️ CHECKOUT ITEMS (before dispatch):", checkoutItems);
    dispatch(setCartPurchase(checkoutItems));
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-[var(--color-primary)] pb-32">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold my-6">My Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT – CART ITEMS */}
          <div className="lg:col-span-2 space-y-4">
            {data.items.map((item: any) => (
              <ProductCartItem
                key={item.variantId}
                item={item}
                onRemove={() =>
                  removeItem({
                    productId: item.productId,
                    variantId: item.variantId,
                  })
                }
                onQuantityChange={(qty) =>
                  updateQty({
                    productId: item.productId,
                    variantId: item.variantId,
                    quantity: qty,
                  })
                }
              />
            ))}
          </div>

          {/* RIGHT – ORDER SUMMARY */}
          <div className="hidden lg:block">
            <div className="bg-[var(--color-card)] p-6 rounded-xl border sticky top-8">
              <h3 className="text-xl font-bold mb-4">Order Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>
                    Price ({data.totalItems}{" "}
                    {data.totalItems === 1 ? "item" : "items"})
                  </span>
                  <span>₹{data.cartListingTotal.toLocaleString()}</span>
                </div>

                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>−₹{data.totalDiscount.toLocaleString()}</span>
                </div>

                <hr />

                <div className="flex justify-between text-lg font-bold">
                  <span>Total Amount</span>
                  <span>₹{data.cartTotal.toLocaleString()}</span>
                </div>
              </div>

              <Button
                onClick={handleCheckout}
                className="w-full mt-6 py-3 font-bold"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE BOTTOM BAR */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="p-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex justify-between w-full"
          >
            <span>{data.totalItems} items</span>
            <span className="font-bold">
              ₹{data.cartTotal.toLocaleString()}
            </span>
            {showDetails ? <ChevronDown /> : <ChevronUp />}
          </button>

          {showDetails && (
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Price</span>
                <span>₹{data.cartListingTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>−₹{data.totalDiscount.toLocaleString()}</span>
              </div>
            </div>
          )}

          <Button
            onClick={handleCheckout}
            className="w-full mt-3 py-3 font-bold"
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
