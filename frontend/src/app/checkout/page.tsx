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
} from "@/components/checkout/CheckoutSummary";
import AddressSection from "@/components/checkout/AddressSection";
import { RootState } from "@/redux/store";
import { setQuantity, setProductId } from "@/redux/slices/checkoutSlice";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const productId = searchParams.get("product");
  const variantId = searchParams.get("variant");
  const urlQuantity = searchParams.get("quantity");

  useEffect(() => {
    if (productId) {
      dispatch(setProductId(productId));
    }
    // ✅ Set quantity from URL if available
    if (urlQuantity) {
      dispatch(setQuantity(parseInt(urlQuantity) || 1));
    }
  }, [productId, urlQuantity, dispatch]);

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

  // ✅ Prepare items and total with variant support
  let items: CheckoutItem[] = [];
  let total = 0;

  if (productId && product && variantId) {
    // ✅ Single product checkout with variant
    const selectedVariant = product.variants?.find((v) => v._id === variantId);

    if (selectedVariant) {
      items = [
        {
          product,
          variantId: selectedVariant._id!,
          quantity,
        },
      ];
      total = selectedVariant.discountedPrice * quantity;
    } else {
      console.error(`Variant ${variantId} not found for product ${productId}`);
    }
  } else if (cartData?.items?.length) {
    // ✅ Cart checkout - assuming backend returns variantId
    items = cartData.items.map(({ product, variantId, quantity }) => ({
      product,
      variantId,
      quantity,
    }));

    // ✅ Calculate total using variant pricing
    total = items.reduce((sum, item) => {
      const variant = item.product.variants?.find(
        (v) => v._id === item.variantId
      );
      return sum + (variant ? variant.discountedPrice * item.quantity : 0);
    }, 0);
  }

  // ✅ Handle Quantity Change with variant support
  const handleQuantityChange = async (index: number, newQuantity: number) => {
    const item = items[index];
    if (!item) return;

    // ✅ Find the variant for stock checking
    const variant = item.product.variants?.find(
      (v) => v._id === item.variantId
    );
    if (!variant) {
      console.error(`Variant ${item.variantId} not found`);
      return;
    }

    if (productId && variantId) {
      // Single product quantity managed in Redux
      const clamped = Math.max(1, Math.min(newQuantity, variant.stock));
      dispatch(setQuantity(clamped));
    } else {
      // Cart quantity update via backend API call
      const clamped = Math.max(1, Math.min(newQuantity, variant.stock));
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

  // Sync addressSelected with Redux address
  useEffect(() => {
    setAddressSelected(!!selectedAddress);
  }, [selectedAddress]);

  if (cartLoading || productLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    );
  }

  // ✅ Error handling for missing variant in direct purchase
  if (productId && product && !variantId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Variant Not Specified
          </h2>
          <p className="text-gray-600 mb-6">
            Please select a product variant before checkout.
          </p>
          <button
            onClick={() => router.back()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back & Select Variant
          </button>
        </div>
      </div>
    );
  }

  // ✅ Error handling for variant not found
  if (productId && product && variantId) {
    const selectedVariant = product.variants?.find((v) => v._id === variantId);
    if (!selectedVariant) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-xl shadow-lg">
            <div className="text-red-500 text-6xl mb-4">❌</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Variant Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The selected product variant is no longer available.
            </p>
            <button
              onClick={() => router.push(`/products/${productId}`)}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              View Product
            </button>
          </div>
        </div>
      );
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-gray-400 text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Cart is Empty
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
        </h1>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          {/* Address Selection */}
          <div>
            <AddressSection onSelectionChange={setAddressSelected} />
          </div>

          {/* Summary and Proceed Button */}
          <div className="sticky top-10 self-start bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <CheckoutSummary
              items={items}
              total={total}
              allowQuantityEdit={
                (!!productId && !!variantId) ||
                (cartData?.items?.length ?? 0) > 0
              }
              onQuantityChange={handleQuantityChange}
            />
            
            <button
              className={`mt-6 w-full rounded-lg py-3 font-semibold text-white transition-colors ${
                addressSelected
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
              onClick={() => {
                if (productId && variantId) {
                  // Direct purchase - pass URL parameters
                  router.push(
                    `/checkout/payment?product=${productId}&variant=${variantId}&quantity=${quantity}`
                  );
                } else {
                  // Cart purchase - no params needed
                  router.push("/checkout/payment");
                }
              }}
              disabled={!addressSelected}
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
