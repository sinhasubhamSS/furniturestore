"use client";

import {
  useGetCartQuery,
  useUpdateQuantityMutation,
  useRemoveItemMutation,
} from "@/redux/services/user/cartApi";
import ProductCartItem from "@/components/cart/cartComponent";
import { useRouter } from "next/navigation";

const CartPage = () => {
  const { data, isLoading } = useGetCartQuery();
  const [updateQty] = useUpdateQuantityMutation();
  const [removeItem] = useRemoveItemMutation();
  const router = useRouter();

  if (isLoading)
    return (
      <p className="text-center mt-16 text-lg text-gray-600">Loading cart...</p>
    );

  if (!data || !data.items || data.items.length === 0) {
    return (
      <p className="text-center mt-16 text-lg font-medium text-gray-700">
        Your cart is empty 😔
      </p>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-10 bg-[--color-bg] rounded-2xl shadow-sm">
      <h1 className="text-3xl font-bold mb-8 text-center">My Cart</h1>
      <div className="space-y-6">
        {data.items.map((item) => (
          <ProductCartItem
            key={item._id}
            product={item.product}
            quantity={item.quantity}
            onRemove={() => removeItem({ productId: item.product._id })}
            onQuantityChange={(qty) =>
              updateQty({ productId: item.product._id, quantity: qty })
            }
          />
        ))}
      </div>
      <div className="mt-10 border-t pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-xl font-semibold">
          Total:{" "}
          <span className="text-[--color-accent]">
            ₹{data.cartTotal?.toFixed(2)}
          </span>
        </div>
        <button
          onClick={() => router.push("/checkout")}
          className="bg-[--color-accent] text-white px-8 py-3 rounded-lg font-semibold text-lg shadow hover:brightness-110 transition"
        >
          Proceed to Checkout
        </button>
      </div>
    </div>
  );
};

export default CartPage;
