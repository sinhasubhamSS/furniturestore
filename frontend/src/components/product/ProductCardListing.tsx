"use client";

import React, { memo } from "react";
import Image from "next/image";
import { FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import type { DisplayProduct } from "@/types/Product";

interface Props {
  product: DisplayProduct;
  isWishlisted: boolean;
  onToggleWishlist: (e: React.MouseEvent) => void;
  canWishlist: boolean;
  disabled: boolean;
}

const PLACEHOLDER = "/placeholder.jpg";

const ProductCardListing = memo(
  ({
    product,
    isWishlisted,
    onToggleWishlist,
    canWishlist,
    disabled,
  }: Props) => {
    const image = product.image || PLACEHOLDER;
    const sellingPrice = product.sellingPrice;
    const listingPrice = product.listingPrice;
    const discountPercent = product.discountPercent ?? 0;
    const hasDiscount = sellingPrice < listingPrice;

    const categoryName =
      typeof product.category === "string" ? "" : product.category?.name ?? "";

    return (
      <div className="flex flex-col h-full bg-[var(--color-card)] border rounded-md hover:shadow-sm transition">
        {/* IMAGE (LCP SAFE) */}
        <div className="relative aspect-[1/1] w-full bg-white overflow-hidden rounded-t-md">
          <Image
            src={image}
            alt={product.name}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain p-2"
          />

          {hasDiscount && discountPercent > 0 && (
            <span className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded">
              {discountPercent}% OFF
            </span>
          )}

          {canWishlist && (
            <button
              onClick={onToggleWishlist}
              disabled={!canWishlist || disabled}
              className="absolute top-1.5 right-1.5 w-7 h-7 bg-white rounded-full shadow flex items-center justify-center"
            >
              {isWishlisted ? (
                <FaHeart className="text-red-500" size={12} />
              ) : (
                <FaRegHeart className="text-gray-600" size={12} />
              )}
            </button>
          )}
        </div>

        {/* CONTENT */}
        <div className="flex flex-col flex-1 p-2">
          <h3 className="text-[13px] sm:text-sm font-semibold leading-snug line-clamp-2">
            {product.name}
          </h3>

          {categoryName && (
            <p className="text-[10px] sm:text-[11px] text-gray-500">
              {categoryName}
            </p>
          )}

          <div className="mt-1">
            <span className="text-sm sm:text-base font-bold text-[var(--color-accent)]">
              ₹{sellingPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="ml-1 text-[10px] text-green-600 font-semibold">
                ({discountPercent}% OFF)
              </span>
            )}
            {hasDiscount && (
              <div className="text-[10px] text-gray-400 line-through">
                MRP ₹{listingPrice.toLocaleString()}
              </div>
            )}
          </div>

          {/* CTA – always bottom */}
          <button className="mt-auto flex items-center justify-center gap-1 text-[11px] sm:text-xs font-semibold px-2 py-1.5 rounded bg-[var(--color-accent)] text-white">
            <FaShoppingCart size={11} /> Add
          </button>
        </div>
      </div>
    );
  }
);

ProductCardListing.displayName = "ProductCardListing";
export default ProductCardListing;
