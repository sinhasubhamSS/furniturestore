"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import {
  useGetCartQuery,
  useUpdateQuantityMutation,
} from "@/redux/services/user/cartApi";
import { useGetProductByIDQuery } from "@/redux/services/user/publicProductApi";
import { useGetCheckoutPricingMutation } from "@/redux/services/user/orderApi";
import CheckoutSummary, { CheckoutItem } from "@/components/checkout/CheckoutSummary";
import AddressSection from "@/components/checkout/AddressSection";
import { RootState } from "@/redux/store";
import {
  updateQuantity,
  updateItemQuantity, // ✅ Add this import
  updateFees,
  setAdvanceEligibility,
} from "@/redux/slices/checkoutSlice";
import { CheckoutPricingResponse } from "@/types/order";

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const router = useRouter();

  const { items, type, selectedAddress, isRehydrated } = useSelector(
    (state: RootState) => state.checkout
  );

  const [deliveryAvailable, setDeliveryAvailable] = useState(true);
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null);
  const [pricingData, setPricingData] = useState<CheckoutPricingResponse | undefined>(undefined);
  const [loadingPricing, setLoadingPricing] = useState(false);

  // ✅ Prevent double API calls
  const quantityUpdateInProgress = useRef(false);

  const productId = type === "direct_purchase" && items.length > 0 ? items[0].productId : null;

  const { data: product, isLoading: productLoading } = useGetProductByIDQuery(
    productId || "",
    { skip: !productId || !isRehydrated }
  );

  const {
    data: cartData,
    isLoading: cartLoading,
    refetch: refetchCart,
  } = useGetCartQuery(undefined, {
    skip: type !== "cart_purchase" || !isRehydrated,
  });

  const [updateQty] = useUpdateQuantityMutation();
  const [getCheckoutPricing] = useGetCheckoutPricingMutation();

  const subtotal = useMemo(() => {
    if (type === "direct_purchase" && items.length && product) {
      const item = items[0];
      const variant = product.variants?.find((v) => v._id === item.variantId);
      if (!variant) return 0;
      const price = variant.hasDiscount ? variant.discountedPrice ?? 0 : variant.price ?? 0;
      return price * item.quantity;
    }

    if (type === "cart_purchase" && cartData?.items?.length) {
      return cartData.items.reduce((sum, item) => {
        const variant = item.product?.variants.find((v) => v._id === item.variantId);
        if (!variant) return sum;
        const price = variant.hasDiscount ? variant.discountedPrice ?? 0 : variant.price ?? 0;
        return sum + price * item.quantity;
      }, 0);
    }

    return 0;
  }, [type, items, product, cartData]);

  const checkoutItems: CheckoutItem[] = useMemo(() => {
  if (type === "direct_purchase" && items.length > 0 && product) {
    const item = items[0];
    const selectedVariant = product.variants?.find((v) => v._id === item.variantId);

    if (selectedVariant) {
      return [{
        product,
        variantId: selectedVariant._id!,
        quantity: item.quantity,
      }];
    }
  } else if (type === "cart_purchase" && cartData?.items?.length) {
    return cartData.items
      .filter(item => item.product !== undefined)  // filter out undefined products
      .map(item => ({
        product: item.product!,           // assert non-null here
        variantId: item.variantId,
        quantity: item.quantity,
      }));
  }
  return [];
}, [type, items, product, cartData]);


  // ✅ Pricing fetch
  useEffect(() => {
    if (!isRehydrated || !selectedAddress?.pincode || items.length === 0) {
      return;
    }

    const fetchPricing = async () => {
      setLoadingPricing(true);
      try {
        const orderItems = items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId || "",
          quantity: item.quantity,
        }));

        const response = await getCheckoutPricing({
          items: orderItems,
          pincode: selectedAddress.pincode,
        }).unwrap();

        setPricingData(response);
        setDeliveryAvailable(response.isServiceable !== false);
        setDeliveryInfo(response.deliveryInfo || null);

        // ✅ SECURE: Use backend values with validation
        if (response.packagingFee !== undefined && response.deliveryCharge !== undefined) {
          dispatch(updateFees({
            packagingFee: response.packagingFee,
            deliveryCharge: response.deliveryCharge,
            totalAmount: response.checkoutTotal,
          }));
        }

        if (response.advanceEligible) {
          dispatch(setAdvanceEligibility({
            eligible: response.advanceEligible,
            orderValue: response.subtotal || subtotal,
            percentage: response.advancePercentage,
            advanceAmount: response.advanceAmount,
            remainingAmount: response.remainingAmount,
          }));
        }
      } catch (error: any) {
        console.error("❌ [CHECKOUT] Pricing fetch failed:", error);
        setPricingData(undefined);
        setDeliveryAvailable(false);
      } finally {
        setLoadingPricing(false);
      }
    };

    fetchPricing();
  }, [selectedAddress?.pincode, items, cartData, isRehydrated, getCheckoutPricing, dispatch, subtotal]);

  useEffect(() => {
    if (!isRehydrated) return;
    if (!type || items.length === 0) {
      console.warn("No checkout data found, redirecting...");
      router.push("/cart");
    }
  }, [type, items, router, isRehydrated]);

  // ✅ FIXED: Quantity update with immediate Redux update + API sync
  const handleQuantityChange = async (index: number, newQuantity: number) => {
    const item = checkoutItems[index];
    if (!item) return;

    const variant = item.product.variants?.find((v) => v._id === item.variantId);
    if (!variant) return;

    const clamped = Math.max(1, Math.min(newQuantity, variant.stock ?? 0));

    // ✅ Prevent rapid successive calls
    if (quantityUpdateInProgress.current) return;

    try {
      quantityUpdateInProgress.current = true;

      if (type === "direct_purchase") {
        dispatch(updateQuantity(clamped));
      } else if (type === "cart_purchase") {
        // ✅ 1. Update Redux immediately for instant UI response
        dispatch(updateItemQuantity({
          productId: item.product._id,
          variantId: item.variantId,
          quantity: clamped,
        }));

        // ✅ 2. Update backend
        await updateQty({
          productId: item.product._id,
          variantId: item.variantId,
          quantity: clamped,
        }).unwrap();

        // ✅ 3. Refetch cart to stay in sync
        await refetchCart();
      }
    } catch (err: any) {
      console.error("❌ [CHECKOUT] Failed to update quantity:", err);
      
      // ✅ Revert Redux state if API failed
      if (type === "cart_purchase") {
        await refetchCart(); // This restores correct state from backend
      }
      
      alert("Failed to update cart quantity. Please try again.");
    } finally {
      quantityUpdateInProgress.current = false;
    }
  };

  const handleProceedToPayment = () => {
    if (!selectedAddress) {
      alert("Please select a delivery address");
      return;
    }

    if (!deliveryAvailable) {
      alert("Selected address is not deliverable. Please choose a different address.");
      return;
    }

    router.push("/checkout/payment");
  };

  const handleAddressSelection = (deliverable: boolean, pricingData?: CheckoutPricingResponse) => {
    setDeliveryAvailable(deliverable);
    if (pricingData) {
      setPricingData(pricingData);
      setDeliveryInfo(pricingData.deliveryInfo);
    }
  };

  // Loading states
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

  if (checkoutItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="text-gray-400 text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Nothing to Checkout</h2>
          <p className="text-gray-600 mb-6">Add some items to your cart to continue.</p>
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
            <AddressSection onSelectionChange={handleAddressSelection} items={items} />
          </div>

          <div className="sticky top-10 self-start bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            {/* ✅ NO FLICKER: Always render CheckoutSummary */}
            <CheckoutSummary
              items={checkoutItems}
              subtotal={subtotal}
              allowQuantityEdit={true}
              onQuantityChange={handleQuantityChange}
              pricingData={pricingData}
              loadingPricing={loadingPricing}
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
                ? "Select Address to View Charges"
                : !deliveryAvailable
                ? "Delivery Not Available"
                : loadingPricing
                ? "Calculating Total..."
                : `Proceed to Payment • ₹${pricingData?.checkoutTotal?.toFixed(2) || subtotal.toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
