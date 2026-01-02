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
      <div className="bg-[var(--color-card)] p-4 rounded-lg text-center text-sm text-[var(--text-accent)]">
        Product variant not available
      </div>
    );
  }

  const sellingPrice = firstVariant.sellingPrice;
  const listingPrice = firstVariant.listingPrice;

  return (
    <div className="w-full rounded-xl border border-[var(--color-border-custom)] bg-[var(--color-card)] p-3 shadow-sm">
      <div className="flex gap-3">
        {/* IMAGE */}
        <div className="h-20 w-20 flex-shrink-0 rounded-lg border bg-[var(--color-secondary)] p-1">
          <Image
            src={firstVariant.images?.[0]?.url || "/placeholder.jpg"}
            alt={product.name}
            width={80}
            height={80}
            className="h-full w-full object-contain"
          />
        </div>

        {/* CONTENT */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {/* TITLE */}
          <div>
            <h3 className="truncate text-sm font-semibold text-[var(--color-foreground)] sm:text-base">
              {product.name}
            </h3>
            <p className="truncate text-xs text-[var(--text-accent)]">
              {product.title}
            </p>
          </div>

          {/* VARIANT + STOCK */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--text-accent)]">
            <span>
              {firstVariant.color} • {firstVariant.size}
            </span>
            {firstVariant.stock && firstVariant.stock > 0 ? (
              <span className="text-green-600">In Stock</span>
            ) : (
              <span className="text-red-500">Out of Stock</span>
            )}
          </div>

          {/* PRICE */}
          <div className="flex flex-wrap items-center gap-2 mt-1">
            <span className="text-base font-semibold text-[var(--color-foreground)]">
              ₹{sellingPrice.toLocaleString()}
            </span>

            {listingPrice &&
              listingPrice > sellingPrice &&
              firstVariant.hasDiscount && (
                <>
                  <span className="text-xs line-through text-gray-400">
                    ₹{listingPrice.toLocaleString()}
                  </span>
                  <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                    {firstVariant.discountPercent}% OFF
                  </span>
                </>
              )}
          </div>

          {/* ACTIONS – FULL WIDTH */}
          <div className="mt-2 flex w-full gap-2">
            {onAddToCart && (
              <Button
                onClick={onAddToCart}
                disabled={
                  isAdding || !firstVariant.stock || firstVariant.stock <= 0
                }
                className="h-9 w-full text-xs"
              >
                {isAdding ? "Adding..." : "Add to Cart"}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={onRemove}
              className="h-9 w-full text-xs"
            >
              Remove
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistItem;
