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
  variant?: "default" | "trending";
};

const ProductCard = ({ product, variant = "default" }: Props) => {
  const router = useRouter();
  const { _id, title, name, price, images, slug, category } = product;

  const productName = title || name;

  const { data: wishlistIds = [], isLoading: isLoadingWishlist } =
    useWishlistidsQuery();

  const [localWishlisted, setLocalWishlisted] = useState<boolean | null>(null);

  const [addToWishlist, { isLoading: isAdding }] = useAddToWishlistMutation();
  const [removeFromWishlist, { isLoading: isRemoving }] =
    useRemoveFromWishlistMutation();

  const isMutating = isAdding || isRemoving;

  const isWishlisted =
    localWishlisted !== null ? localWishlisted : wishlistIds.includes(_id);

  useEffect(() => {
    setLocalWishlisted(null);
  }, [wishlistIds, _id]);

  const handleWishlistClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isLoadingWishlist || isMutating) return;

    const newState = !isWishlisted;
    setLocalWishlisted(newState);

    try {
      if (newState) {
        await addToWishlist({ productId: _id });
      } else {
        await removeFromWishlist({ productId: _id });
      }
      setLocalWishlisted(null);
    } catch (error) {
      setLocalWishlisted(isWishlisted);
      console.error("❌ Wishlist toggle failed:", error);
    }
  };

  const handleProductClick = () => {
    router.push(`/products/${slug}`);
  };

  const getImageUrl = (): string => {
    if (images && images.length > 0) {
      return images[0].url;
    }
    return "/images/placeholder.jpg";
  };

  return (
    <div
      onClick={handleProductClick}
      className="relative cursor-pointer  p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col"
    >
      {/* Wishlist Button */}
      <button
        onClick={handleWishlistClick}
        disabled={isLoadingWishlist || isMutating}
        className={`absolute top-2 right-2 z-10  p-1 rounded-full shadow-sm ${
          isWishlisted ? "text-red-500" : "text-gray-500"
        } ${isMutating ? "opacity-50" : ""}`}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        {isMutating ? (
          <div className="w-3 h-3 rounded-full bg-red-400 " />
        ) : isWishlisted ? (
          <AiFillHeart className="w-3 h-3" />
        ) : (
          <FiHeart className="w-3 h-3" />
        )}
      </button>

      {/* Product Image */}
      <div
        className={`
      w-full mb-3 rounded overflow-hidden
      ${variant === "trending" ? "h-48" : "aspect-square"}
    `}
      >
        <img
          src={getImageUrl()}
          alt={productName}
          loading="lazy"
          className={`w-full h-full object-contain ${
            variant === "trending" ? "object-scale-down" : ""
          }`}
          onError={(e) => {
            e.currentTarget.src = "/images/placeholder.jpg";
          }}
        />
      </div>

      {/* Product Info */}
      <div className="space-y-1">
        {/* Product Name */}
        <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-4">
          {productName}
        </h3>

        {/* Price */}
        <p className="text-base font-bold text-[var(--color-accent)]">
          ₹{price.toLocaleString()}
        </p>

        {/* Category */}
        <p className="text-xs text-gray-600">{category.name}</p>
      </div>
    </div>
  );
};

export default ProductCard;
