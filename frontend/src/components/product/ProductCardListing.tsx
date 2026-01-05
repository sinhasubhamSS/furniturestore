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

  // ✅ listing rule
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

  return (
    <div className="group relative flex flex-col rounded-lg overflow-hidden bg-[var(--color-card)] border border-[var(--color-border-custom)] hover:shadow-lg">
      {/* IMAGE */}
      <div className="relative aspect-[4/3] bg-[var(--color-primary)]">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-contain p-3"
        />

        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded">
            {discountPercent}% OFF
          </span>
        )}

        {/* ❤️ WISHLIST */}
        <button
          onClick={handleWishlist}
          disabled={!canWishlist || isMutating}
          className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow
                     flex items-center justify-center
                     transition-transform active:scale-90 disabled:opacity-50"
        >
          {isWishlisted ? (
            <FaHeart className="text-red-500" size={14} />
          ) : (
            <FaRegHeart className="text-gray-600" size={14} />
          )}
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex flex-col justify-between p-3 flex-1">
        <h3 className="text-sm font-semibold line-clamp-2">{product.name}</h3>

        <div className="mt-2">
          <span className="text-base font-bold text-[var(--color-accent)]">
            ₹{sellingPrice.toLocaleString()}
          </span>
        </div>

        <button className="mt-2 flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-md bg-[var(--color-accent)] text-white">
          <FaShoppingCart size={12} /> Add
        </button>
      </div>
    </div>
  );
});

ProductCardListing.displayName = "ProductCardListing";
export default ProductCardListing;
