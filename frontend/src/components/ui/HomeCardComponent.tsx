"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/Product";
import { FiHeart } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useIsInWishlistQuery,
} from "@/redux/services/user/wishlistApi";

type Props = {
  product: Product;
};

const ProductCard = ({ product }: Props) => {
  const router = useRouter();
  const { _id, title, price, images, slug } = product;

  // Query to check if it's wishlisted
  const { data, refetch, isLoading: isChecking } = useIsInWishlistQuery(_id);
  const [addToWishlist, { isLoading: isAdding }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemoving }] =
    useRemoveFromWishlistMutation();

  const isWishlisted = data?.isWishlisted;
  const isMutating = isAdding || isRemoving;

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card navigation

    try {
      if (isWishlisted) {
        await removeFromWishlist({ productId: _id });
      } else {
        await addToWishlist({ productId: _id });
      }

      await refetch(); // Recheck status
    } catch (err) {
      console.error("❌ Wishlist toggle failed:", err);
    }
  };

  return (
    <div
      onClick={() => router.push(`/products/${slug}`)}
      className="relative cursor-pointer bg-white dark:bg-[var(--color-secondary)] p-4 rounded-xl shadow-md hover:shadow-lg transition-transform duration-300 hover:-translate-y-1"
    >
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        disabled={isChecking || isMutating}
        className={`absolute top-2 right-2 z-10 bg-white/90 p-1 rounded-full shadow-sm transition-transform hover:scale-105 ${
          isWishlisted ? "text-red-500" : "text-gray-400"
        }`}
      >
        {isWishlisted ? (
          <AiFillHeart className="w-5 h-5 fill-current" />
        ) : (
          <FiHeart className="w-5 h-5 stroke-current" />
        )}
      </button>

      {/* Product Image */}
      <div className="w-full aspect-square mb-3 rounded-md overflow-hidden bg-white">
        <img
          src={images?.[0]?.url}
          alt={title}
          loading="lazy"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Product Info */}
      <h3 className="text-sm font-medium text-[var(--foreground)] line-clamp-2">
        {title}
      </h3>

      <p className="text-sm font-semibold text-[var(--foreground)] mt-1">
        ₹{price}
      </p>
    </div>
  );
};

export default ProductCard;
