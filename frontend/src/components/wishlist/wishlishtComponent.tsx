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
  const variant = product.variants.find((v) => v._id === variantId);
  if (!variant) return null;

  const isOutOfStock = variant.stock <= 0;

  const imageUrl =
    variant.images?.find((img) => img.isPrimary)?.url ||
    variant.images?.[0]?.url ||
    product.repImage ||
    product.image ||
    "/placeholder.jpg";

  return (
    <div className="rounded-lg border bg-[var(--color-card)] overflow-hidden hover:shadow-md transition">
      {/* IMAGE – WHITE BACKGROUND ONLY */}
      <div className="bg-white p-4 flex items-center justify-center">
        <Image
          src={imageUrl}
          alt={product.name}
          width={180}
          height={180}
          className="object-contain"
        />
      </div>

      {/* CONTENT */}
      <div className="p-3 flex flex-col gap-1">
        <h3 className="text-sm font-medium line-clamp-2">{product.name}</h3>

        <div className="text-xs text-gray-500 line-clamp-1">
          {[
            variant.attributes?.finish,
            variant.attributes?.size,
            variant.attributes?.seating,
            variant.attributes?.configuration,
          ]
            .filter(Boolean)
            .join(" • ")}
        </div>

        {/* PRICE */}
        <div className="mt-1 flex items-center gap-2">
          <span className="font-semibold text-sm">
            ₹{variant.sellingPrice.toLocaleString()}
          </span>

          {variant.listingPrice > variant.sellingPrice && (
            <span className="text-xs line-through text-gray-400">
              ₹{variant.listingPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* ACTIONS */}
        <div className="mt-2 flex gap-2">
          {onAddToCart && (
            <Button
              onClick={onAddToCart}
              disabled={isAdding || isOutOfStock}
              className="h-8 flex-1 text-xs"
            >
              {isOutOfStock ? "Out" : "Move to Cart"}
            </Button>
          )}

          <Button
            variant="outline"
            onClick={onRemove}
            className="h-8 px-2 text-xs"
          >
            ✕
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WishlistItem;
