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
  const variant = product.variants.find(v => v._id === variantId);
  if (!variant) return null;

  const isOutOfStock = variant.stock <= 0;

  const imageUrl =
    variant.images?.find(img => img.isPrimary)?.url ||
    variant.images?.[0]?.url ||
    product.repImage ||
    product.image ||
    "/placeholder.jpg";

  return (
    <div className="flex items-center gap-2 border-b bg-white px-2 py-2">
      {/* IMAGE */}
      <div className="h-14 w-14 flex-shrink-0 flex items-center justify-center">
        <Image
          src={imageUrl}
          alt={product.name}
          width={56}
          height={56}
          className="object-contain"
        />
      </div>

      {/* INFO */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {product.name}
        </p>

        <p className="text-xs text-gray-500 truncate">
          ₹{variant.sellingPrice.toLocaleString()}
        </p>
      </div>

      {/* ACTIONS – SINGLE ROW, SLIM */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {onAddToCart && (
          <Button
            onClick={onAddToCart}
            disabled={isAdding || isOutOfStock}
            className="
              h-8
              px-2
              text-xs
              rounded-md
              flex items-center gap-1
            "
          >
            <ShoppingCart size={14} />
            {isOutOfStock ? "Out" : "Cart"}
          </Button>
        )}

        <button
          onClick={onRemove}
          className="
            h-8
            w-8
            rounded-md
            border
            flex items-center justify-center
            text-gray-500
            hover:text-red-600
            hover:bg-red-50
            transition
          "
          title="Remove"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
};

export default WishlistItem;
