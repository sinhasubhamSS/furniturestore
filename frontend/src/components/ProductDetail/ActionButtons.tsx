"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAddToCartMutation } from "@/redux/services/user/cartApi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import Button from "@/components/ui/Button";

type Props = {
  productId: string;
};

const ActionButtons: React.FC<Props> = ({ productId }) => {
  const router = useRouter();
  const { selectedVariant, quantity } = useSelector(
    (state: RootState) => state.productDetail
  );
  const [addToCart, { isLoading: isAdding }] = useAddToCartMutation();

  const handleBuyNow = () => {
    // ✅ Use productId prop instead of product._id
    if (selectedVariant?._id && productId) {
      router.push(
        `/checkout?product=${productId}&variant=${selectedVariant._id}&quantity=${quantity}`
      );
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
