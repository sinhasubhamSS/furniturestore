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

    return (
      <div className="group relative flex flex-col bg-[var(--color-card)] border border-[var(--color-border-custom)] rounded-md">
        {/* IMAGE */}
        <div className="relative h-32 sm:h-36 bg-white rounded-t-md">
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-contain p-2"
          />

          {hasDiscount && (
            <span className="absolute top-1.5 left-1.5 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-sm">
              {discountPercent}% OFF
            </span>
          )}

          {/* ❤️ WISHLIST */}
          <button
            onClick={onToggleWishlist}
            disabled={!canWishlist || disabled}
            className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-white shadow flex items-center justify-center disabled:opacity-50"
          >
            {isWishlisted ? (
              <FaHeart className="text-red-500" size={12} />
            ) : (
              <FaRegHeart className="text-gray-600" size={12} />
            )}
          </button>
        </div>

        {/* CONTENT */}
        <div className="p-2">
          <h3 className="text-sm font-semibold line-clamp-2">{product.name}</h3>

          <div className="mt-1">
            <span className="font-bold text-[var(--color-accent)]">
              ₹{sellingPrice.toLocaleString()}
            </span>
            {hasDiscount && (
              <div className="text-[10px] line-through text-gray-400">
                ₹{listingPrice.toLocaleString()}
              </div>
            )}
          </div>

          <button className="mt-2 w-full text-xs bg-[var(--color-accent)] text-white py-1.5 rounded-sm">
            <FaShoppingCart size={11} /> Add
          </button>
        </div>
      </div>
    );
  }
);

export default ProductCardListing;
