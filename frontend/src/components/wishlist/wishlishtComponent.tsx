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
  if (!firstVariant) return null;

  const { sellingPrice, listingPrice } = firstVariant;

  return (
    <div className="group relative w-full rounded-2xl border border-[var(--color-border-custom)] bg-[var(--color-card)] p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex gap-4">
        {/* IMAGE */}
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border bg-[var(--color-secondary)]">
          <Image
            src={firstVariant.images?.[0]?.url || "/placeholder.jpg"}
            alt={product.name}
            fill
            sizes="96px"
            className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* CONTENT */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* TITLE */}
          <div>
            <h3 className="truncate text-base font-semibold text-[var(--color-foreground)]">
              {product.name}
            </h3>
            <p className="truncate text-xs text-[var(--text-accent)]">
              {product.title}
            </p>
          </div>

          {/* META */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[var(--text-accent)]">
              {firstVariant.color} • {firstVariant.size}
            </span>

            {firstVariant.stock && firstVariant.stock > 0 ? (
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">
                In Stock
              </span>
            ) : (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-red-600">
                Out of Stock
              </span>
            )}
          </div>

          {/* PRICE */}
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-lg font-bold text-[var(--color-foreground)]">
              ₹{sellingPrice.toLocaleString()}
            </span>

            {listingPrice &&
              listingPrice > sellingPrice &&
              firstVariant.hasDiscount && (
                <>
                  <span className="text-sm line-through text-gray-400">
                    ₹{listingPrice.toLocaleString()}
                  </span>
                  <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-700">
                    {firstVariant.discountPercent}% OFF
                  </span>
                </>
              )}
          </div>

          {/* ACTIONS */}
          <div className="mt-3 flex w-full gap-2">
            {onAddToCart && (
              <Button
                onClick={onAddToCart}
                disabled={
                  isAdding || !firstVariant.stock || firstVariant.stock <= 0
                }
                className="h-10 w-full text-sm font-medium"
              >
                {isAdding ? "Adding..." : "Move to Cart"}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={onRemove}
              className="h-10 w-full text-sm"
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
