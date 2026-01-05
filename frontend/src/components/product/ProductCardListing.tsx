"use client";

import React, { memo } from "react";
import Image from "next/image";
import { FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import type { DisplayProduct } from "@/types/Product";
import { useWishlist } from "@/hooks/useWishlist";

interface Props {
  product: DisplayProduct;
}

const PLACEHOLDER = "/placeholder.jpg";

const ProductCardListing = memo(({ product }: Props) => {
  const { isInWishlist, toggleWishlist, isMutating } = useWishlist();

  const variantId = product.primaryVariantId;
  const canWishlist = Boolean(variantId);
  const isWishlisted = !!variantId && isInWishlist(product._id, variantId);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!variantId || isMutating) return;
    await toggleWishlist(product._id, variantId);
  };

  const image = product.image || PLACEHOLDER;
  const sellingPrice = product.sellingPrice;
  const listingPrice = product.listingPrice;
  const discountPercent = product.discountPercent ?? 0;
  const hasDiscount = sellingPrice < listingPrice;

  const categoryName =
    typeof product.category === "string" ? "" : product.category?.name ?? "";

  return (
    <div
      className="
        group
        relative
        flex flex-col
        bg-[var(--color-card)]
        border border-[var(--color-border-custom)]
        rounded-md
        hover:shadow-sm
        transition
      "
    >
      {/* IMAGE */}
      <div className="relative h-32 sm:h-36 bg-white flex items-center justify-center rounded-t-md">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-contain p-2"
        />

        {hasDiscount && discountPercent > 0 && (
          <span className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-sm">
            {discountPercent}% OFF
          </span>
        )}

        {/* WISHLIST */}
        <button
          onClick={handleWishlist}
          disabled={!canWishlist || isMutating}
          className="
            absolute top-1.5 right-1.5
            w-7 h-7
            rounded-full
            bg-white shadow
            flex items-center justify-center
            active:scale-90
            disabled:opacity-50
          "
        >
          {isWishlisted ? (
            <FaHeart className="text-red-500" size={12} />
          ) : (
            <FaRegHeart className="text-gray-600" size={12} />
          )}
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex flex-col flex-1 p-2 sm:p-2.5">
        <div>
          <h3 className="text-[13px] sm:text-sm font-semibold leading-snug line-clamp-2">
            {product.name}
          </h3>

          {categoryName && (
            <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5">
              {categoryName}
            </p>
          )}
        </div>

        {/* PRICE */}
        <div className="mt-1">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-sm sm:text-base font-bold text-[var(--color-accent)]">
              ₹{sellingPrice.toLocaleString()}
            </span>

            {hasDiscount && (
              <span className="text-[10px] sm:text-[11px] text-green-600 font-semibold">
                ({discountPercent}% OFF)
              </span>
            )}
          </div>

          {hasDiscount && (
            <div className="text-[10px] sm:text-[11px] text-gray-400 line-through">
              MRP ₹{listingPrice.toLocaleString()}
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          className="
            mt-2
            flex items-center justify-center gap-1
            text-[11px] sm:text-xs
            font-semibold
            px-2 py-1.5
            rounded-sm
            bg-[var(--color-accent)]
            text-white
            hover:opacity-95
          "
        >
          <FaShoppingCart size={11} /> Add
        </button>
      </div>
    </div>
  );
});

ProductCardListing.displayName = "ProductCardListing";
export default ProductCardListing;
