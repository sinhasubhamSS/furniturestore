"use client";

import { DisplayProduct } from "@/types/Product";
import Image from "next/image";
import Button from "@/components/ui/Button";

type Props = {
  product: DisplayProduct;
  variantId: string; // 🔥 IMPORTANT
  onRemove: () => void;
  onAddToCart?: () => void;
  isAdding?: boolean;
};

const WishlistItem = ({
  product,
  variantId,
  onRemove,
  onAddToCart,
  isAdding,
}: Props) => {
  const selectedVariant = product.variants.find((v) => v._id === variantId);

  if (!selectedVariant) return null;

  const { sellingPrice, listingPrice } = selectedVariant;

  return (
    <div className="group relative w-full rounded-2xl border border-[var(--color-border-custom)] bg-[var(--color-card)] p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex gap-4">
        {/* IMAGE */}
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border bg-[var(--color-secondary)]">
          <Image
            src={selectedVariant.images?.[0]?.url || "/placeholder.jpg"}
            alt={product.name}
            fill
            sizes="96px"
            className="object-contain p-2 transition-transform group-hover:scale-105"
          />
        </div>

        {/* CONTENT */}
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="truncate text-base font-semibold">{product.name}</h3>
          <p className="truncate text-xs text-[var(--text-accent)]">
            {product.title}
          </p>

          {/* META */}
          <div className="mt-1 flex flex-wrap gap-2 text-xs">
            <span>
              {selectedVariant.color} • {selectedVariant.size}
            </span>

            {selectedVariant.stock > 0 ? (
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
          <div className="mt-2 flex items-center gap-2">
            <span className="text-lg font-bold">
              ₹{sellingPrice.toLocaleString()}
            </span>

            {listingPrice > sellingPrice && (
              <>
                <span className="text-sm line-through text-gray-400">
                  ₹{listingPrice.toLocaleString()}
                </span>
                <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  {selectedVariant.discountPercent}% OFF
                </span>
              </>
            )}
          </div>

          {/* ACTIONS */}
          <div className="mt-3 flex gap-2">
            {onAddToCart && (
              <Button
                onClick={onAddToCart}
                disabled={isAdding || selectedVariant.stock <= 0}
                className="h-10 w-full"
              >
                {isAdding ? "Adding..." : "Move to Cart"}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={onRemove}
              className="h-10 w-full"
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
