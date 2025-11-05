"use client";

import React, { memo, useMemo } from "react";
import { FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import { DisplayProduct } from "@/types/Product";
import { useWishlistManager } from "@/hooks/useWishlistManger"; // keep original

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
    // use group to enable hover effects on children
    <div
      className="group relative flex flex-col h-80 cursor-pointer transition-transform duration-200 rounded-none"
      style={{
        // subtle border using your token
        border: "1px solid var(--color-border-custom)",
        background: "var(--color-card)",
      }}
      role="group"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          // allow parent Link to handle navigation; nothing extra here
        }
      }}
    >
      {/* IMAGE SECTION: rectangular, image BG uses primary */}
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          height: "56%", // taller image area to keep rectangle look
          background: "var(--color-primary)",
          borderBottom: "1px solid rgba(0,0,0,0.04)",
        }}
      >
        <img
          src={variant?.images?.[0]?.url || "/placeholder.jpg"}
          alt={product.name}
          className="max-h-full max-w-full object-contain p-4"
        />

        {/* discount badge */}
        {variant.hasDiscount && (
          <div
            className="absolute top-3 left-3 text-xs font-semibold px-2 py-0.5 rounded"
            style={{ background: "var(--color-secondary)", color: "var(--text-light)" }}
          >
            {discountPercent}% OFF
          </div>
        )}

        {/* wishlist */}
        <button
          onClick={handleWishlist}
          disabled={isLoading}
          aria-label={isProductInWishlist ? "Remove from wishlist" : "Add to wishlist"}
          aria-pressed={isProductInWishlist}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center z-10"
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border-custom)",
          }}
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
            <FaRegHeart style={{ color: "var(--text-accent, #4e2a13)" }} />
          )}
        </button>

        {/* QUICK VIEW overlay (visible on hover) */}
        <div
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
          style={{
            background: "linear-gradient(180deg, rgba(0,0,0,0.0), rgba(0,0,0,0.18))",
          }}
        >
          <div className="pointer-events-auto flex gap-2">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // trigger quick view modal if you have one
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
                // placeholder add to cart
                console.info("Add to cart:", product._id);
              }}
              className="px-3 py-1 rounded bg-[var(--color-accent)] text-white text-sm hover:opacity-90 flex items-center gap-2"
            >
              <FaShoppingCart /> Add
            </button>
          </div>
        </div>
      </div>

      {/* TEXT AREA: use matching tone */}
      <div
        className="flex-1 flex flex-col justify-between px-3 py-2"
        style={{ background: "var(--color-card-secondary)" }}
      >
        <div>
          <h3
            className="text-sm font-semibold line-clamp-2 mb-1"
            title={product.name}
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

      {/* card hover effect: border + shadow via group-hover (applied to parent by tailwind classes) */}
      <style jsx>{`
        .group:hover {
          box-shadow: 0 8px 20px rgba(0,0,0,0.08);
          transform: translateY(-4px);
          border-color: var(--color-hover-card);
        }
      `}</style>
    </div>
  );
}, (prev, next) => prev.product._id === next.product._id);

ProductCardListing.displayName = "ProductCardListing";
export default ProductCardListing;
