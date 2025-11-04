"use client";

import React, { memo, useMemo } from "react";
import { DisplayProduct } from "@/types/Product";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useWishlistManager } from "@/hooks/useWishlistManger";

interface ProductCardListingProps {
  product: DisplayProduct;
}

const ProductCardListing = memo(({ product }: ProductCardListingProps) => {
  const variant = product.variants[0];
  const {
    isInWishlist,
    addToWishlist,
    removeFromWishlist,
    isProductLoading,
  } = useWishlistManager();

  const isProductInWishlist = useMemo(
    () => isInWishlist(product._id),
    [isInWishlist, product._id]
  );

  const isLoading = useMemo(
    () => isProductLoading(product._id),
    [isProductLoading, product._id]
  );

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      if (isProductInWishlist) {
        await removeFromWishlist(product._id);
      } else {
        await addToWishlist(product._id);
      }
    } catch (error) {
      console.error("Wishlist action failed:", error);
    }
  };

  const discountedPrice = variant.hasDiscount ? variant.discountedPrice : null;
  const originalPrice = variant.price;

  return (
    <div className="flex flex-col bg-gray-50 border border-gray-300 shadow-sm h-full cursor-pointer transition-colors duration-300 hover:bg-gray-100 hover:shadow-md rounded-none">
      {/* Image Container */}
      <div className="relative h-56 bg-white border-b border-gray-200 overflow-hidden flex items-center justify-center">
        <img
          src={variant?.images?.[0]?.url || "/placeholder.jpg"}
          alt={product.name}
          className="max-h-52 object-contain p-3"
        />
        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          disabled={isLoading}
          aria-label={isProductInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full shadow flex items-center justify-center transition-transform duration-200 z-10 border border-gray-300 bg-white ${
            isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110"
          }`}
        >
          {isLoading ? (
            <div className="animate-spin w-4 h-4 border border-current border-t-transparent rounded-full"></div>
          ) : isProductInWishlist ? (
            <FaHeart className="text-red-600 text-sm" />
          ) : (
            <FaRegHeart className="text-gray-500 text-sm hover:text-red-600" />
          )}
        </button>
      </div>

      {/* Text Area */}
      <div className="flex-1 flex flex-col justify-center px-5 py-4 text-left">
        <h2 className="text-base font-semibold text-gray-900 line-clamp-2 mb-3">
          {product.name}
        </h2>
        <div className="flex items-center gap-4">
          {discountedPrice !== null ? (
            <>
              <span className="text-xl font-bold text-blue-700">
                ₹{discountedPrice.toFixed(2)}
              </span>
              <span className="text-sm line-through text-gray-400">
                ₹{originalPrice?.toFixed(2)}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold text-blue-700">
              ₹{originalPrice?.toFixed(2)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
});

ProductCardListing.displayName = "ProductCardListing";
export default ProductCardListing;
