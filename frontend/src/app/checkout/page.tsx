"use client";

import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import {
  useGetCartQuery,
  useUpdateQuantityMutation,
} from "@/redux/services/user/cartApi";
import { useGetProductByIDQuery } from "@/redux/services/user/publicProductApi";
import CheckoutSummary, {
  CheckoutItem,
} from "@/components/checkout/CheckoutSummary";
import AddressSection from "@/components/checkout/AddressSection";
import { RootState } from "@/redux/store";
import { updateQuantity } from "@/redux/slices/checkoutSlice";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  // ✅ ALL HOOKS AT TOP LEVEL - No conditionals!
  const { items, type, selectedAddress, isRehydrated } = useSelector(
    (state: RootState) => state.checkout
  );

  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null);

  const productId =
    type === "direct_purchase" && items.length > 0 ? items[0].productId : null;

  // ✅ Always call these hooks - use skip parameter for conditional logic
  const { data: product, isLoading: productLoading } = useGetProductByIDQuery(
    productId || "",
    { skip: !productId || !isRehydrated }
  );

  const { data: cartData, isLoading: cartLoading } = useGetCartQuery(
    undefined,
    { skip: type !== "cart_purchase" || !isRehydrated }
  );

  const [updateQty] = useUpdateQuantityMutation();

  // ✅ All useEffect hooks should be at top level
  useEffect(() => {
    if (!isRehydrated) return;

    if (!type || items.length === 0) {
      console.warn("No checkout data found, redirecting...");
      router.push("/cart");
    }
  }, [type, items, router, isRehydrated]);

  // ✅ Now conditional rendering AFTER all hooks
  if (!isRehydrated || cartLoading || productLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // ✅ Rest of component logic
  let checkoutItems: CheckoutItem[] = [];
  let total = 0;

  if (type === "direct_purchase" && items.length > 0 && product) {
    const item = items[0];
    const selectedVariant = product.variants?.find(
      (v) => v._id === item.variantId
    );

    if (selectedVariant) {
      checkoutItems = [
        {
          product,
          variantId: selectedVariant._id!,
          quantity: item.quantity,
        },
      ];
      const price = selectedVariant.hasDiscount
        ? selectedVariant.discountedPrice ?? 0
        : selectedVariant.price ?? 0;
      total = price * item.quantity;
    }
  } else if (type === "cart_purchase" && cartData?.items?.length) {
    checkoutItems = cartData.items.map(({ product, variantId, quantity }) => ({
      product,
      variantId,
      quantity,
    }));

    total = checkoutItems.reduce((sum, item) => {
      const variant = item.product.variants?.find(
        (v) => v._id === item.variantId
      );
      if (variant) {
        const price = variant.hasDiscount
          ? variant.discountedPrice ?? 0
          : variant.price ?? 0;
        return sum + price * item.quantity;
      }
      return sum;
    }, 0);
  }

  const handleQuantityChange = async (index: number, newQuantity: number) => {
    const item = checkoutItems[index];
    if (!item) return;

    const variant = item.product.variants?.find(
      (v) => v._id === item.variantId
    );
    if (!variant) return;

    const clamped = Math.max(1, Math.min(newQuantity, variant.stock ?? 0));

    if (type === "direct_purchase") {
      dispatch(updateQuantity(clamped));
    } else if (type === "cart_purchase") {
      try {
        await updateQty({
          productId: item.product._id,
          variantId: item.variantId,
          quantity: clamped,
        }).unwrap();
      } catch (err) {
        alert("Failed to update cart quantity. Please try again.");
        console.error(err);
      }
    }
  };

  const handleProceedToPayment = () => {
    if (!selectedAddress) {
      alert("Please select a delivery address");
      return;
    }

    if (!deliveryAvailable) {
      alert(
        "Selected address is not deliverable. Please choose a different address."
      );
      return;
    }

    router.push("/checkout/payment");
  };

  const handleAddressSelection = (deliverable: boolean, deliveryData?: any) => {
    setDeliveryAvailable(deliverable);
    setDeliveryInfo(deliveryData);
  };

  const deliveryCharge =
    deliveryInfo?.finalCharge || deliveryInfo?.deliveryCharge || 0;

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-gray-400 text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Nothing to Checkout
          </h2>
          <p className="text-gray-600 mb-6">
            Add some items to your cart to continue.
          </p>
          <button
            onClick={() => router.push("/products")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-center text-3xl font-bold mb-10 text-gray-800">
          Checkout
          <span className="text-sm text-gray-500 block mt-1">
            {type === "direct_purchase" ? "Direct Purchase" : "Cart Purchase"}
          </span>
        </h1>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          <div>
            <AddressSection onSelectionChange={handleAddressSelection} />
          </div>

          <div className="sticky top-10 self-start bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <CheckoutSummary
              items={checkoutItems}
              total={total}
              allowQuantityEdit={true}
              onQuantityChange={handleQuantityChange}
              deliveryCharge={deliveryCharge}
              deliveryInfo={deliveryInfo}
              deliveryAvailable={deliveryAvailable}
              hasSelectedAddress={!!selectedAddress}
            />

            <button
              className={`mt-6 w-full rounded-lg py-3 font-semibold text-white transition-colors ${
                selectedAddress && deliveryAvailable
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              onClick={handleProceedToPayment}
              disabled={!selectedAddress || !deliveryAvailable}
            >
              {!selectedAddress
                ? "Select Address"
                : !deliveryAvailable
                ? "Delivery Not Available"
                : "Proceed to Payment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
