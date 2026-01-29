"use client";

import { DisplayProduct } from "@/types/Product";
import Image from "next/image";
import Button from "@/components/ui/Button";

type Props = {
  product: DisplayProduct;
  variantId: string;
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
  const isOutOfStock = selectedVariant.stock <= 0;

  return (
    <div className="group relative w-full rounded-2xl border border-[var(--color-border-custom)] bg-[var(--color-card)] p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      {/* 🔥 Responsive Layout */}
      <div className="flex flex-col gap-4 sm:flex-row xl:flex-col">
        {/* IMAGE */}
        <div className="relative mx-auto h-28 w-28 sm:mx-0 sm:h-24 sm:w-24 xl:h-40 xl:w-full overflow-hidden rounded-xl border bg-[var(--color-secondary)]">
          <Image
            src={selectedVariant.images?.[0]?.url || "/placeholder.jpg"}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 112px, (max-width: 1280px) 96px, 320px"
            className="object-contain p-3 transition-transform group-hover:scale-105"
          />
        </div>

        {/* CONTENT */}
        <div className="flex min-w-0 flex-1 flex-col text-center sm:text-left xl:text-left">
          <h3 title={product.name} className="truncate text-base font-semibold">
            {product.name}
          </h3>

          <p className="truncate text-xs text-[var(--text-accent)]">
            {product.title}
          </p>

          {/* META */}
          <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2 text-xs">
            <span className="text-[var(--text-accent)]">
              {[
                selectedVariant.attributes?.finish,
                selectedVariant.attributes?.size,
                selectedVariant.attributes?.seating,
                selectedVariant.attributes?.configuration,
              ]
                .filter(Boolean)
                .join(" • ")}
            </span>

            {!isOutOfStock ? (
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
          <div className="mt-3 flex items-center justify-center sm:justify-start gap-2">
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
          <div className="mt-4 flex gap-2">
            {onAddToCart && (
              <Button
                onClick={onAddToCart}
                disabled={isAdding || isOutOfStock}
                className="h-10 w-full"
              >
                {isOutOfStock
                  ? "Out of Stock"
                  : isAdding
                    ? "Adding..."
                    : "Move to Cart"}
              </Button>
            )}

            <Button
              variant="outline"
              onClick={onRemove}
              disabled={isAdding}
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
