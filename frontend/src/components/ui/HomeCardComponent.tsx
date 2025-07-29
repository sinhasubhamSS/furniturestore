"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Product } from "@/types/Product";
import { FiHeart } from "react-icons/fi";
import { AiFillHeart } from "react-icons/ai";
import {
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
  useWishlistidsQuery,
} from "@/redux/services/user/wishlistApi";

type Props = {
  product: Product;
};

const ProductCard = ({ product }: Props) => {
  const router = useRouter();
  const { _id, title, price, images, slug } = product;

  // Fetch wishlist product IDs (cached)
  const { data: wishlistIds = [], isLoading: isLoadingWishlist } =
    useWishlistidsQuery();

  // Local state for optimistic toggle (null = no override, true/false = optimistically set)
  const [localWishlisted, setLocalWishlisted] = useState<boolean | null>(null);

  const [addToWishlist, { isLoading: isAdding }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemoving }] =
    useRemoveFromWishlistMutation();

  const isMutating = isAdding || isRemoving;

  // Determine wishlist state for this product allowing optimistic override
  const isWishlisted =
    localWishlisted !== null ? localWishlisted : wishlistIds.includes(_id);

  // Reset optimistic state if global wishlist changes or product changes
  useEffect(() => {
    setLocalWishlisted(null);
  }, [wishlistIds, _id]);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isLoadingWishlist || isMutating) return; // prevent clicks while loading/mutating

    const newState = !isWishlisted;
    setLocalWishlisted(newState); // optimistic update

    try {
      if (newState) {
        console.log(`Adding product  to wishlist`);
        await addToWishlist({ productId: _id });
      } else {
        console.log(`Removing product  from wishlist`);
        await removeFromWishlist({ productId: _id });
      }
      setLocalWishlisted(null); // reset and rely on cache to update state
    } catch (error) {
      setLocalWishlisted(isWishlisted); // revert optimistic update on error
      console.error("❌ Wishlist toggle failed:", error);
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
        disabled={isLoadingWishlist || isMutating}
        className={`absolute top-2 right-2 z-10 bg-white/90 p-1 rounded-full shadow-sm transition-transform hover:scale-105 ${
          isWishlisted ? "text-red-500" : "text-gray-400"
        }`}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        {isMutating ? (
          <div className="w-5 h-5 rounded-full bg-red-400 animate-pulse" />
        ) : isWishlisted ? (
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
