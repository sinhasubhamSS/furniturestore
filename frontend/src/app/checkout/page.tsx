"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useGetCartQuery,
  useUpdateQuantityMutation,
} from "@/redux/services/user/cartApi";

import { useGetProductByIDQuery } from "@/redux/services/user/publicProductApi";
import CheckoutSummary, {
  CheckoutItem,
  Product,
} from "@/components/checkout/CheckoutSummary";
import AddressSection from "@/components/checkout/AddressSection";
import { RootState } from "@/redux/store";
import { setQuantity, setProductId } from "@/redux/slices/checkoutSlice";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const productId = searchParams.get("product");
  useEffect(() => {
    if (productId) {
      dispatch(setProductId(productId)); // redux slice me productId set karo
    }
  }, [productId, dispatch]);
  const { data: cartData, isLoading: cartLoading } = useGetCartQuery();
  const { data: product, isLoading: productLoading } = useGetProductByIDQuery(
    productId || "",
    {
      skip: !productId,
    }
  );

  const { quantity, selectedAddress } = useSelector(
    (state: RootState) => state.checkout
  );
  const [addressSelected, setAddressSelected] = useState(!!selectedAddress);

  // Hook for cart quantity update mutation
  const [updateQty] = useUpdateQuantityMutation();

  // Prepare items and total
  let items: CheckoutItem[] = [];
  let total = 0;

  if (productId && product) {
    items = [{ product, quantity }];
    total = product.price * quantity;
  } else if (cartData?.items?.length) {
    items = cartData.items.map(({ product, quantity }) => ({
      product,
      quantity,
    }));
    total = cartData.cartTotal ?? 0;
  }

  // Handle Quantity Change
  const handleQuantityChange = async (index: number, newQuantity: number) => {
    if (productId) {
      // Single product quantity managed in Redux.
      const clamped = Math.max(
        1,
        Math.min(newQuantity, items[index].product.stock)
      );
      dispatch(setQuantity(clamped));
    } else {
      // Cart quantity update via backend API call.
      const item = items[index];
      if (!item) return;

      const clamped = Math.max(1, Math.min(newQuantity, item.product.stock));
      try {
        await updateQty({
          productId: item.product._id,
          quantity: clamped,
        }).unwrap();
        // On success, RTK query will refetch cart data automatically.
      } catch (err) {
        alert("Failed to update cart quantity. Please try again.");
        console.error(err);
      }
    }
  };

  // Sync addressSelected with Redux address
  useEffect(() => {
    setAddressSelected(!!selectedAddress);
  }, [selectedAddress]);

  if (cartLoading || productLoading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (items.length === 0) {
    return <p className="text-center mt-10">Your cart is empty</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-center text-3xl font-bold mb-10">Checkout</h1>
        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          {/* Address Selection */}
          <div>
            <AddressSection onSelectionChange={setAddressSelected} />
          </div>

          {/* Summary and Proceed Button */}
          <div className="sticky top-10 self-start bg-white p-6 rounded-xl shadow-md border border-gray-300">
            <CheckoutSummary
              items={items}
              total={total}
              allowQuantityEdit={
                !!productId || (cartData?.items?.length ?? 0) > 0
              }
              onQuantityChange={handleQuantityChange}
            />
            <button
              className={`mt-6 w-full rounded-lg py-3 font-semibold text-white ${
                addressSelected
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              onClick={() => router.push("/checkout/payment")}
              disabled={!addressSelected}
            >
              Proceed to Pay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
