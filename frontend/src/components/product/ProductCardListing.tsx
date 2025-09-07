"use client";

import React, { useState, memo, useMemo } from "react";
import { DisplayProduct } from "@/types/Product";
import { useAddToCartMutation } from "@/redux/services/user/cartApi";
import { useWishlistManager } from "@/hooks/useWishlistManger";
import Button from "../ui/Button";
import { FaHeart, FaRegHeart } from "react-icons/fa";

interface ProductCardListingProps {
  product: DisplayProduct;
}

const ProductCardListing = memo(({ product }: ProductCardListingProps) => {
  const [activeVariant, setActiveVariant] = useState(product.variants[0]);
  const [addToCart] = useAddToCartMutation();

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

  const uniqueColors = [...new Set(product.variants.map((v) => v.color))];
  const getVariantByColor = (color: string) =>
    product.variants.find((v) => v.color === color);

  const handleColorSelect = (e: React.MouseEvent, color: string) => {
    e.preventDefault();
    e.stopPropagation();
    const variant = getVariantByColor(color);
    if (variant) setActiveVariant(variant);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart({
        productId: product._id,
        variantId: activeVariant._id!,
        quantity: 1,
      }).unwrap();
    } catch (error) {
      console.error("Add to cart failed:", error);
    }
  };

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

  const displayPrice = activeVariant.hasDiscount
    ? activeVariant.discountedPrice
    : activeVariant.price;

  const savings = activeVariant.hasDiscount
    ? (activeVariant.price || 0) - (activeVariant.discountedPrice || 0)
    : 0;

  return (
    <div className="w-full bg-[var(--color-card)] border border-[var(--color-border-custom)] hover:shadow transition-shadow duration-200 overflow-hidden">
      <div className="flex items-center p-3 min-h-[120px]"> {/* Reduced padding & height */}
        {/* Image */}
        <div className="flex-shrink-0 w-28 h-28 mr-4 relative bg-gray-50 overflow-hidden border border-[var(--color-border-custom)]">
          <img
            src={activeVariant.images[0]?.url || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-full object-contain p-1 transition-transform duration-300 hover:scale-105"
          />
          {activeVariant.hasDiscount && (
            <div className="absolute -top-1 -left-1 bg-red-600 text-white px-1 py-0.5 text-xs font-semibold shadow-lg z-10 select-none">
              {activeVariant.discountPercent}% OFF
            </div>
          )}
          {/* Wishlist Button */}
          <button
            onClick={handleWishlist}
            disabled={isLoading}
            aria-label={
              isProductInWishlist ? "Remove from wishlist" : "Add to wishlist"
            }
            className={`absolute top-1 right-1 w-7 h-7 rounded-full shadow flex items-center justify-center transition-transform duration-200 z-10 border border-[var(--color-border-custom)] ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:scale-110"
            }`}
          >
            {isLoading ? (
              <div className="animate-spin w-3 h-3 border border-current border-t-transparent rounded-full"></div>
            ) : isProductInWishlist ? (
              <FaHeart className="text-red-600 text-sm" />
            ) : (
              <FaRegHeart className="text-[var(--text-accent)] text-sm hover:text-red-600" />
            )}
          </button>
        </div>

        {/* Details */}
        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-[var(--color-foreground)] line-clamp-2 leading-snug mb-0.5">
              {product.name}
            </h2>
            <p className="text-xs text-[var(--text-accent)] font-medium m-0">
              {product.category?.name}
            </p>
            {product.description && (
              <p className="text-[var(--text-accent)] line-clamp-2 my-1 leading-relaxed text-xs">
                {product.description}
              </p>
            )}
          </div>

          <div className="flex items-center gap-4 mb-2 flex-wrap text-xs">
            {uniqueColors.length > 1 && (
              <div className="flex items-center gap-1 flex-wrap">
                <span className="font-medium text-[var(--text-accent)]">Color:</span>
                <div className="flex gap-1">
                  {uniqueColors.slice(0, 5).map((color) => {
                    const variant = getVariantByColor(color);
                    if (!variant) return null;

                    return (
                      <button
                        key={color}
                        className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] ${
                          activeVariant.color === color
                            ? "border-[var(--color-accent)] ring-2 ring-[var(--color-accent)]"
                            : "border-gray-300 hover:border-gray-400"
                        }`}
                        style={{ backgroundColor: color.toLowerCase() }}
                        onClick={(e) => handleColorSelect(e, color)}
                        title={color}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {activeVariant.size && (
              <div className="flex items-center gap-1 text-xs">
                <span className="font-medium text-[var(--text-accent)]">Size:</span>
                <span className="bg-[var(--color-surface-secondary)] px-2 py-0.5 rounded-md font-medium">
                  {activeVariant.size}
                </span>
              </div>
            )}

            <div className="flex items-center gap-1 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  activeVariant.stock > 0 ? "bg-green-500" : "bg-red-500"
                }`}
              ></span>
              <span
                className={`font-medium ${
                  activeVariant.stock > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {activeVariant.stock > 0
                  ? activeVariant.stock < 5
                    ? `Only ${activeVariant.stock} left!`
                    : "In Stock"
                  : "Out of Stock"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-2 mt-1">
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-lg font-bold text-[var(--color-foreground)]">
                  ₹{displayPrice?.toFixed(2) || "0.00"}
                </span>

                {activeVariant.hasDiscount && (
                  <span className="text-xs text-[var(--text-accent)] line-through">
                    ₹{activeVariant.price?.toFixed(2)}
                  </span>
                )}

                {activeVariant.hasDiscount && (
                  <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md font-semibold whitespace-nowrap">
                    Save ₹{savings.toFixed(2)}
                  </span>
                )}
              </div>

              {product.warranty && (
                <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-md font-medium inline-flex items-center gap-1 select-none">
                  🛡️ {product.warranty}
                </span>
              )}
            </div>

            <Button
              onClick={handleAddToCart}
              disabled={activeVariant.stock === 0}
              className="px-5 py-1.5 bg-[var(--color-accent)] hover:bg-[var(--color-hover-card)] text-white font-semibold rounded transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-sm"
            >
              {activeVariant.stock > 0 ? "🛒 Add to Cart" : "❌ Out of Stock"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

ProductCardListing.displayName = "ProductCardListing";
export default ProductCardListing;
