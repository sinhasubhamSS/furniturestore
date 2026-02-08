"use client";

import { DisplayProduct } from "@/types/Product";
import Image from "next/image";
import Button from "@/components/ui/Button";
import { Trash2, ShoppingCart } from "lucide-react";

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
    <div className="flex gap-3 sm:gap-4 bg-white px-3 py-3 sm:py-4">
      {/* IMAGE */}
      <div className="h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 border rounded-md flex items-center justify-center bg-gray-50">
        <Image
          src={imageUrl}
          alt={product.name}
          width={80}
          height={80}
          className="object-contain"
        />
      </div>

      {/* INFO */}
      <div className="flex-1 min-w-0">
        <p className="text-sm sm:text-base font-medium truncate">
          {product.name}
        </p>

        <p className="text-sm text-gray-600 mt-1">
          ₹{variant.sellingPrice.toLocaleString()}
        </p>

        {isOutOfStock && (
          <span className="inline-block mt-1 text-xs text-red-600">
            Out of stock
          </span>
        )}
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row items-center gap-2">
        {onAddToCart && (
          <Button
            onClick={onAddToCart}
            disabled={isAdding || isOutOfStock}
            className="
              h-8 sm:h-9
              px-3
              text-xs sm:text-sm
              rounded-md
              flex items-center gap-1
            "
          >
            <ShoppingCart size={14} />
            {isOutOfStock ? "Out" : "Add"}
          </Button>
        )}

        <button
          onClick={onRemove}
          className="
            h-8 w-8 sm:h-9 sm:w-9
            rounded-md
            border
            flex items-center justify-center
            text-gray-500
            hover:text-red-600
            hover:bg-red-50
            transition
          "
          title="Remove from wishlist"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default WishlistItem;
