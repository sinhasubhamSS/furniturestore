"use client";

import {
  useGetCartQuery,
  useUpdateQuantityMutation,
  useRemoveItemMutation,
} from "@/redux/services/user/cartApi";
import ProductCartItem from "@/components/cart/cartComponent";
import { useRouter } from "next/navigation";

const CartPage = () => {
  const { data, isLoading, error } = useGetCartQuery();
  const [updateQty] = useUpdateQuantityMutation();
  const [removeItem] = useRemoveItemMutation();
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-16">
        <p className="text-red-500">Error loading cart. Please try again.</p>
      </div>
    );
  }

  if (!data || !data.items || data.items.length === 0) {
    return (
      <div className="text-center mt-16">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">Add some items to get started!</p>
        <button
          onClick={() => router.push("/products")}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10 bg-[--color-bg] rounded-2xl shadow-sm">
      <h1 className="text-3xl font-bold mb-8 text-center">My Cart</h1>

      {/* Cart Items */}
      <div className="space-y-6">
        {data.items.map((item, index) => (
          <ProductCartItem
            key={`${item.product._id}-${item.variantId}`} // ✅ Unique key with variant
            product={item.product}
            variantId={item.variantId} // ✅ Pass variant ID
            quantity={item.quantity}
            onRemove={() =>
              removeItem({
                productId: item.product._id,
                variantId: item.variantId, // ✅ Include variantId
              })
            }
            onQuantityChange={(qty) =>
              updateQty({
                productId: item.product._id,
                variantId: item.variantId, // ✅ Include variantId
                quantity: qty,
              })
            }
          />
        ))}
      </div>

      {/* Cart Summary */}
      <div className="mt-10 border-t pt-8">
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal ({data.totalItems} items):</span>
              <span>₹{data.cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST:</span>
              <span>₹{data.cartGST.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-xl font-bold border-t pt-2">
              <span>Total:</span>
              <span className="text-[--color-accent]">
                ₹{data.cartTotal.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => router.push("/checkout")}
            className="bg-[--color-accent] text-white px-8 py-3 rounded-lg font-semibold text-lg shadow hover:brightness-110 transition"
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
