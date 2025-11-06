"use client";

import React, { memo, useMemo } from "react";
import { FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import { DisplayProduct } from "@/types/Product";
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
      if (isProductInWishlist) await removeFromWishlist(product._id);
      else await addToWishlist(product._id);
    } catch (err) {
      console.error("Wishlist action failed:", err);
    }
  };

  const discountedPrice = variant.hasDiscount ? variant.discountedPrice : null;
  const originalPrice = variant.price;
  const discountPercent =
    discountedPrice && originalPrice
      ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100)
      : 0;

  return (
    <div
      className="group relative flex flex-col h-80 cursor-pointer transition-transform duration-200 rounded-md"
      style={{
        background: "var(--color-card)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* IMAGE SECTION */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          height: "56%",
          background: "var(--color-primary)",
        }}
      >
        <img
          src={variant?.images?.[0]?.url || "/placeholder.jpg"}
          alt={product.name}
          className="max-h-full max-w-full object-contain p-4 transition-transform duration-200 group-hover:scale-105"
        />

        {/* Discount badge */}
        {variant.hasDiscount && (
          <div
            className="absolute top-3 left-3 text-xs font-semibold px-2 py-0.5 rounded"
            style={{
              background: "var(--color-secondary)",
              color: "var(--text-light)",
            }}
          >
            {discountPercent}% OFF
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={handleWishlist}
          disabled={isLoading}
          aria-label={isProductInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isProductInWishlist}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center z-10 bg-[var(--color-card)] shadow-sm"
        >
          {isLoading ? (
            <div
              className="animate-spin w-4 h-4 rounded-full"
              style={{
                border: "2px solid var(--color-accent)",
                borderTopColor: "transparent",
              }}
            />
          ) : isProductInWishlist ? (
            <FaHeart style={{ color: "var(--color-accent)" }} />
          ) : (
            <FaRegHeart style={{ color: "var(--text-accent)" }} />
          )}
        </button>

        {/* Hover overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.15))",
          }}
        >
          <div className="pointer-events-auto flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.info("Quick view:", product._id);
              }}
              className="px-3 py-1 rounded bg-[rgba(0,0,0,0.6)] text-white text-sm hover:opacity-90"
            >
              Quick view
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.info("Add to cart:", product._id);
              }}
              className="px-3 py-1 rounded bg-[var(--color-accent)] text-white text-sm hover:opacity-90 flex items-center gap-2"
            >
              <FaShoppingCart /> Add
            </button>
          </div>
        </div>
      </div>

      {/* TEXT SECTION */}
      <div
        className="flex-1 flex flex-col justify-between px-3 py-2"
        style={{ background: "var(--color-card-secondary)" }}
      >
        <div>
          <h3
            className="text-sm font-semibold line-clamp-2 mb-1"
            style={{ color: "var(--color-foreground)" }}
          >
            {product.name}
          </h3>
          {product.category?.name && (
            <div className="text-xs mb-1" style={{ color: "var(--text-accent)" }}>
              {product.category.name}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-baseline gap-2">
            {discountedPrice !== null ? (
              <>
                <span
                  className="text-base font-bold"
                  style={{ color: "var(--color-accent)" }}
                >
                  ₹{discountedPrice.toFixed(0)}
                </span>
                <span className="text-xs line-through" style={{ color: "var(--text-accent)" }}>
                  ₹{originalPrice?.toFixed(0)}
                </span>
              </>
            ) : (
              <span className="text-base font-bold" style={{ color: "var(--color-accent)" }}>
                ₹{originalPrice?.toFixed(0)}
              </span>
            )}
          </div>
          <div className="ml-auto text-xs font-semibold" style={{ color: "var(--text-accent)" }}>
            Free delivery
          </div>
        </div>
      </div>

      {/* Hover animation: subtle shadow lift */}
      <style jsx>{`
        .group:hover {
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
          transform: translateY(-4px);
        }
      `}</style>
    </div>
  );
}, (prev, next) => prev.product._id === next.product._id);

ProductCardListing.displayName = "ProductCardListing";
export default ProductCardListing;
