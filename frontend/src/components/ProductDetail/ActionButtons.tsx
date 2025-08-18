"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAddToCartMutation } from "@/redux/services/user/cartApi";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/redux/store";
import { setDirectPurchase } from "@/redux/slices/checkoutSlice"; // ✅ Import new action
import Button from "@/components/ui/Button";

type Props = {
  productId: string;
};

const ActionButtons: React.FC<Props> = ({ productId }) => {
  const router = useRouter();
  const dispatch = useDispatch(); // ✅ Add dispatch
  const { selectedVariant, quantity } = useSelector(
    (state: RootState) => state.productDetail
  );
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();

  // ✅ Updated Buy Now handler - No URL params!
  const handleBuyNow = () => {
    if (selectedVariant?._id && productId) {
      // ✅ Set checkout data in Redux
      dispatch(
        setDirectPurchase({
          productId: productId,
          variantId: selectedVariant._id,
          quantity: quantity,
        })
      );

      // ✅ Navigate to checkout (no URL params needed)
      router.push("/checkout");
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariant?._id) {
      alert("Please select a variant first");
      return;
    }

    try {
      await addToCart({
        productId,
        variantId: selectedVariant._id,
        quantity,
      }).unwrap();

      // ✅ Optional: Show success message
      // toast.success("Added to cart!");
    } catch (err) {
      console.error("Add to cart failed:", err);
      alert("Failed to add to cart. Please try again.");
    }
  };

  // ✅ Better disabled conditions
  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;
  const isVariantSelected = !!selectedVariant?._id;

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      <Button
        onClick={handleAddToCart}
        disabled={isAdding || isOutOfStock || !isVariantSelected}
        className="flex-1 bg-gray-900 text-white hover:bg-gray-800 py-2.5 rounded-lg transition font-medium flex items-center justify-center gap-2"
      >
        {isAdding ? "Adding..." : "Add to Cart"}
      </Button>

      <Button
        onClick={handleBuyNow}
        disabled={isOutOfStock || !isVariantSelected}
        className="flex-1 bg-[--color-accent] text-white hover:bg-[--color-accent-dark] py-2.5 rounded-lg transition font-medium"
      >
        Buy Now
      </Button>
    </div>
  );
};

export default ActionButtons;
