"use client";

import { DisplayProduct } from "@/types/Product";
import Image from "next/image";
import Button from "@/components/ui/Button";

type Props = {
  product: DisplayProduct;
  onRemove: () => void;
  onAddToCart?: () => void;
  isAdding?: boolean;
};

const WishlistItem = ({ product, onRemove, onAddToCart, isAdding }: Props) => {
  const firstVariant = product.variants?.[0];

  if (!firstVariant) {
    return (
      <div className="bg-[var(--color-card)] p-3 rounded-lg text-center text-[var(--text-accent)] text-sm">
        Product variant not available
      </div>
    );
  }

  const sellingPrice = firstVariant.sellingPrice;
  const listingPrice = firstVariant.listingPrice;

  return (
    <div className="bg-[var(--color-card)] rounded-lg shadow-sm border border-[var(--color-border-custom)] hover:shadow-md transition-shadow">
      <div className="flex gap-2 p-2">
        {/* Left - Image */}
        <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-lg overflow-hidden bg-[var(--color-secondary)] flex items-center justify-center border border-[var(--color-border-custom)] p-1 flex-shrink-0">
          <Image
            src={firstVariant.images?.[0]?.url || "/placeholder.jpg"}
            alt={product.name}
            width={64}
            height={64}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Right - Product Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          {/* Top Row - Title and Remove (Mobile Only) */}
          <div className="flex items-start justify-between gap-2 sm:block">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-[var(--color-foreground)] truncate leading-tight">
                {product.name}
              </h3>
              <p className="text-[var(--text-accent)] text-xs truncate">
                {product.title}
              </p>
            </div>

            {/* Remove Button - Mobile Only */}
            <Button
              variant="outline"
              onClick={onRemove}
              className="text-xs px-2 py-1 flex-shrink-0 sm:hidden"
            >
              Remove
            </Button>
          </div>

          {/* Middle Row - Compact Info */}
          <div className="text-xs text-[var(--text-accent)] mt-1">
            <span>{firstVariant.color}</span> • <span>{firstVariant.size}</span>
            {firstVariant.stock && firstVariant.stock > 0 ? (
              <span className="text-green-600 ml-2">In Stock</span>
            ) : (
              <span className="text-red-500 ml-2">Out of Stock</span>
            )}
          </div>

          {/* Bottom Row - Price and Actions */}
          <div className="flex items-center justify-between gap-2 mt-1">
            {/* Price */}
            <div className="flex items-center gap-1">
              {/* FINAL PRICE */}
              <span className="text-base sm:text-lg font-medium text-[var(--color-foreground)]">
                ₹{sellingPrice.toLocaleString()}
              </span>

              {/* MRP + Discount */}
              {listingPrice &&
                listingPrice > sellingPrice &&
                firstVariant.hasDiscount && (
                  <>
                    <span className="text-xs line-through text-gray-500">
                      ₹{listingPrice.toLocaleString()}
                    </span>
                    <span className="bg-green-100 text-green-700 px-1 py-0.5 rounded text-xs">
                      {firstVariant.discountPercent}% off
                    </span>
                  </>
                )}
            </div>

            {/* Bottom Actions - Desktop/Tablet */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Add to Cart */}
              {onAddToCart && (
                <Button
                  onClick={onAddToCart}
                  disabled={
                    isAdding || !firstVariant.stock || firstVariant.stock <= 0
                  }
                  className="text-xs px-2 py-1"
                >
                  {isAdding ? "Adding..." : "Add to Cart"}
                </Button>
              )}

              {/* Remove Button - Desktop/Tablet Only */}
              <Button
                variant="outline"
                onClick={onRemove}
                className="text-xs px-2 py-1 hidden sm:block"
              >
                Remove
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistItem;
