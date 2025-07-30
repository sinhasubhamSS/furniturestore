// pages/checkout.tsx or components/CheckoutPage.tsx
"use client";

import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, useSearchParams } from "next/navigation";
import { useGetCartQuery } from "@/redux/services/user/cartApi";
import { useGetProductByIDQuery } from "@/redux/services/user/publicProductApi";
import CheckoutSummary, {
  CheckoutItem,
  Product,
} from "@/components/checkout/CheckoutSummary";
import AddressSection from "@/components/checkout/AddressSection";
import { RootState } from "@/redux/store";
import { setQuantity } from "@/redux/slices/checkoutSlice";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const productId = searchParams.get("product") || null;

  const { data: cartData, isLoading: cartLoading } = useGetCartQuery();
  const { data: product, isLoading: productLoading } = useGetProductByIDQuery(
    productId ?? "",
    {
      skip: !productId,
    }
  );

  const { quantity, selectedAddress } = useSelector(
    (state: RootState) => state.checkout
  );

  // Prepare checkout items & total
  let items: CheckoutItem[] = [];
  let total = 0;

  if (productId && product) {
    items = [{ product, quantity }];
    total = product.price * quantity;
  } else if (cartData?.items?.length) {
    items = cartData.items.map(
      ({ product, quantity }: { product: Product; quantity: number }) => ({
        product,
        quantity,
      })
    );
    total = cartData.cartTotal ?? 0;
  }

  const [addressSelected, setAddressSelected] = useState(!!selectedAddress);

  const handleQuantityChange = (index: number, newQty: number) => {
    if (productId) {
      const clampedQty = Math.max(
        1,
        Math.min(newQty, items[index].product.stock)
      );
      dispatch(setQuantity(clampedQty));
    }
    // For cart quantity edit: implement update cart API call & Redux update accordingly
  };

  if (cartLoading || productLoading) {
    return <p className="text-center mt-10">Loading...</p>;
  }

  if (!items.length) {
    return <p className="text-center mt-10">Your cart is empty.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-center text-3xl font-bold mb-10">Checkout</h1>
        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          {/* Left: Address Section */}
          <div>
            <AddressSection onSelectionChange={setAddressSelected} />
          </div>

          {/* Right: Summary and Proceed Button */}
          <div className="sticky top-10 self-start bg-white p-6 rounded-xl shadow-md border border-gray-300">
            <CheckoutSummary
              items={items}
              total={total}
              allowQuantityEdit={!!productId}
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
