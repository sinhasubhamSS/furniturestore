"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAddToCartMutation } from "@/redux/services/user/cartApi";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/redux/store";
import { setDirectPurchase } from "@/redux/slices/checkoutSlice";
import Button from "@/components/ui/Button";

type Props = {
  productId: string;
};

const ActionButtons: React.FC<Props> = ({ productId }) => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  const { selectedVariant, quantity } = useSelector(
    (state: RootState) => state.productDetail,
  );

  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();

  const handleBuyNow = () => {
    if (!selectedVariant?._id) return;

    dispatch(
      setDirectPurchase({
        productId,
        variantId: selectedVariant._id,
        quantity,
      }),
    );

    router.push("/checkout");
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
    } catch (err) {
      console.error("Add to cart failed:", err);
      alert("Failed to add to cart. Please try again.");
    }
  };

  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;
  const isVariantSelected = !!selectedVariant?._id;

  return (
    <div className="flex w-full gap-2 sm:gap-3 items-center">
      {/* ADD TO CART */}
      <Button
        onClick={handleAddToCart}
        disabled={isAdding || isOutOfStock || !isVariantSelected}
        className="
          flex-1 min-w-0
          bg-gray-900 text-white hover:bg-gray-800
          py-2.5 sm:py-3 md:py-4
          text-[13px] sm:text-sm md:text-base lg:text-lg
          font-semibold
          rounded-md sm:rounded-lg
          transition
          disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        {isAdding ? "Adding…" : "Add to Cart"}
      </Button>

      {/* BUY NOW */}
      <Button
        onClick={handleBuyNow}
        disabled={isOutOfStock || !isVariantSelected}
        className="
          flex-1 min-w-0
          bg-[--color-accent] text-white hover:bg-[--color-accent-dark]
          py-2.5 sm:py-3 md:py-4
          text-[13px] sm:text-sm md:text-base lg:text-lg
          font-semibold
          rounded-md sm:rounded-lg
          transition
          disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        Buy Now
      </Button>
    </div>
  );
};

export default ActionButtons;
