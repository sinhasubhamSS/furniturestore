"use client";

import React, { memo } from "react";
import Image from "next/image";
import { FaHeart, FaRegHeart, FaShoppingCart } from "react-icons/fa";
import type { DisplayProduct } from "@/types/Product";
import { useWishlistManager } from "@/hooks/useWishlistManger";

interface Props {
  product: DisplayProduct;
}

const PLACEHOLDER = "/placeholder.jpg";

const ProductCardListing = memo(({ product }: Props) => {
  const { isInWishlist, addToWishlist, removeFromWishlist, isProductLoading } =
    useWishlistManager();

  const isWishlisted = isInWishlist(product._id);
  const isLoading = isProductLoading(product._id);

  const handleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    isWishlisted
      ? await removeFromWishlist(product._id)
      : await addToWishlist(product._id);
  };

  /* BACKEND DATA */
  const image = product.image || PLACEHOLDER;
  const sellingPrice = product.sellingPrice;
  const listingPrice = product.listingPrice;
  const discountPercent = product.discountPercent ?? 0;
  const hasDiscount =
    listingPrice && sellingPrice && sellingPrice < listingPrice;

  const categoryName =
    typeof product.category === "string" ? "" : product.category?.name ?? "";

  return (
    <div
      className="
        group relative flex flex-col
        rounded-lg overflow-hidden
        bg-[var(--color-card)]
        border border-[var(--color-border-custom)]
        transition-all duration-200
        hover:shadow-lg hover:-translate-y-0.5
      "
    >
      {/* ================= IMAGE ================= */}
      <div className="relative aspect-[4/3] bg-[var(--color-primary)]">
        <Image
          src={image}
          alt={product.name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
          className="object-contain p-3"
          priority
        />

        {/* DISCOUNT BADGE */}
        {hasDiscount && discountPercent > 0 && (
          <span className="absolute top-2 left-2 bg-red-600 text-white text-[11px] font-bold px-2 py-0.5 rounded">
            {discountPercent}% OFF
          </span>
        )}

        {/* WISHLIST */}
        <button
          onClick={handleWishlist}
          disabled={isLoading}
          className="
            absolute top-2 right-2
            w-8 h-8 rounded-full
            bg-white shadow
            flex items-center justify-center
            hover:scale-105 transition
          "
        >
          {isWishlisted ? (
            <FaHeart className="text-red-500" size={14} />
          ) : (
            <FaRegHeart className="text-gray-600" size={14} />
          )}
        </button>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="flex flex-col justify-between p-3 flex-1">
        {/* TITLE */}
        <div>
          <h3 className="text-sm font-semibold leading-snug line-clamp-2">
            {product.name}
          </h3>

          {categoryName && (
            <p className="text-xs text-gray-500 mt-0.5">{categoryName}</p>
          )}
        </div>

        {/* PRICE */}
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-[var(--color-accent)]">
              ₹{sellingPrice.toLocaleString()}
            </span>

            {hasDiscount && (
              <span className="text-xs line-through text-gray-400">
                ₹{listingPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* FOOTER */}
          <div className="mt-2 flex items-center justify-between">
            <span
              className={`text-xs font-semibold ${
                product.inStock ? "text-green-600" : "text-gray-500"
              }`}
            >
              {product.inStock ? "In stock" : "Free delivery"}
            </span>

            <button
              className="
                flex items-center gap-1
                text-xs font-semibold
                px-3 py-1.5
                rounded-md
                bg-[var(--color-accent)]
                text-white
                hover:opacity-90
              "
            >
              <FaShoppingCart size={12} /> Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ProductCardListing.displayName = "ProductCardListing";
export default ProductCardListing;
