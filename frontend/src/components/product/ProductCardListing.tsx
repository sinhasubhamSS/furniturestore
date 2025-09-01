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
    isProductLoading, // ✅ Use per-product loading
  } = useWishlistManager();

  const isProductInWishlist = useMemo(
    () => isInWishlist(product._id),
    [isInWishlist, product._id]
  );

  // ✅ Check loading for this specific product
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
      console.log("✅ Added to cart:", product.name);
    } catch (error) {
      console.error("❌ Add to cart failed:", error);
    }
  };

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      if (isProductInWishlist) {
        await removeFromWishlist(product._id);
        console.log("✅ Removed from wishlist:", product.name);
      } else {
        await addToWishlist(product._id);
        console.log("✅ Added to wishlist:", product.name);
      }
    } catch (error) {
      console.error("❌ Wishlist action failed:", error);
    }
  };

  const displayPrice = activeVariant.hasDiscount
    ? activeVariant.discountedPrice
    : activeVariant.price;

  const savings = activeVariant.hasDiscount
    ? (activeVariant.price || 0) - (activeVariant.discountedPrice || 0)
    : 0;

  return (
    <div className="w-full bg-white border-b border-gray-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center p-6 min-h-[200px]">
        {/* Left: Product Image */}
        <div className="flex-shrink-0 w-44 h-44 mr-8 relative bg-gray-50 rounded-lg overflow-hidden border border-gray-100">
          <img
            src={activeVariant.images[0]?.url || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-full object-contain p-2 hover:scale-105 transition-transform duration-300"
          />

          {/* Discount Badge */}
          {activeVariant.hasDiscount && (
            <div className="absolute -top-1 -left-1 bg-red-500 text-white px-2 py-1 text-xs font-bold rounded-md shadow-lg z-10">
              {activeVariant.discountPercent}% OFF
            </div>
          )}

          {/* ✅ Wishlist Button - Only this product's loading affects it */}
          <button
            onClick={handleWishlist}
            disabled={isLoading} // ✅ Per-product loading state
            className={`absolute top-2 right-2 w-9 h-9 rounded-full shadow-md flex items-center justify-center transition-all duration-200 z-10 border border-gray-200 ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer hover:scale-110"
            }`}
          >
            {isLoading ? (
              <div className="animate-spin w-4 h-4 border border-current border-t-transparent rounded-full"></div>
            ) : isProductInWishlist ? (
              <FaHeart className="text-red-500 text-lg" />
            ) : (
              <FaRegHeart className="text-gray-500 text-lg hover:text-red-500" />
            )}
          </button>
        </div>

        {/* Right: Product Details - Same as before */}
        <div className="flex-1 min-w-0">
          <div className="mb-6">
            <div className="mb-3">
              <h2 className="text-2xl font-semibold text-gray-900 line-clamp-2 leading-tight mb-2">
                {product.name}
              </h2>
              <p className="text-sm text-gray-500 font-medium">
                {product.category?.name}
              </p>
            </div>

            {product.description && (
              <p className="text-gray-600 line-clamp-2 mb-4 leading-relaxed">
                {product.description}
              </p>
            )}

            <div className="flex items-center gap-8 mb-4">
              {uniqueColors.length > 1 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 font-medium">
                    Color:
                  </span>
                  <div className="flex gap-1">
                    {uniqueColors.slice(0, 5).map((color) => {
                      const variant = getVariantByColor(color);
                      if (!variant) return null;

                      return (
                        <button
                          key={color}
                          className={`w-7 h-7 rounded-full border-2 transition-all hover:scale-110 ${
                            activeVariant.color === color
                              ? "border-blue-500 ring-2 ring-blue-200"
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
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700 font-medium">
                    Size:
                  </span>
                  <span className="text-sm bg-gray-100 px-3 py-1 rounded-md font-medium">
                    {activeVariant.size}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    activeVariant.stock > 0 ? "bg-green-500" : "bg-red-500"
                  }`}
                ></span>
                <span
                  className={`text-sm font-medium ${
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
          </div>

          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-4 mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  ₹{displayPrice?.toFixed(2) || "0.00"}
                </span>

                {activeVariant.hasDiscount && (
                  <div className="flex items-center gap-3">
                    <span className="text-xl text-gray-500 line-through">
                      ₹{activeVariant.price?.toFixed(2)}
                    </span>
                    <span className="text-sm bg-green-100 text-green-700 px-3 py-1 rounded-md font-semibold">
                      Save ₹{savings.toFixed(2)}
                    </span>
                  </div>
                )}
              </div>

              {product.warranty && (
                <div className="mt-2">
                  <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-md font-medium inline-flex items-center gap-1">
                    🛡️ {product.warranty}
                  </span>
                </div>
              )}
            </div>

            <div>
              <Button
                onClick={handleAddToCart}
                disabled={activeVariant.stock === 0}
                className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed text-lg"
              >
                {activeVariant.stock > 0 ? "🛒 Add to Cart" : "❌ Out of Stock"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ProductCardListing.displayName = "ProductCardListing";
export default ProductCardListing;
