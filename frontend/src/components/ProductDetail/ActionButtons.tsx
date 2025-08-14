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
    if (selectedVariant?._id) {
      router.push(
        `/checkout?product=${selectedVariant._id}&quantity=${quantity}`
      );
    }
  };

  const handleAddToCart = async () => {
    try {
      await addToCart({
        productId,
        variantId: selectedVariant!._id,
        quantity,
      }).unwrap();
    } catch (err) {
      console.error("Add to cart failed:", err);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      {" "}
      {/* Reduced gap from 3 to 2 */}
      <Button
        onClick={handleAddToCart}
        disabled={isAdding || !selectedVariant?.stock}
        className="flex-1 bg-gray-900 text-white hover:bg-gray-800 py-2.5 rounded-lg transition font-medium flex items-center justify-center gap-2" // Reduced py from 3 to 2.5
      >
        {isAdding ? "Adding..." : "Add to Cart"}
      </Button>
      <Button
        onClick={handleBuyNow}
        disabled={!selectedVariant?.stock}
        className="flex-1 bg-[--color-accent] text-white hover:bg-[--color-accent-dark] py-2.5 rounded-lg transition font-medium" // Reduced py from 3 to 2.5
      >
        Buy Now
      </Button>
    </div>
  );
};

export default ActionButtons;
